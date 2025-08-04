import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, threadId, model, provider, temperature, maxTokens } = await req.json();
    
    console.log('Chat completion request:', { threadId, model, provider, messagesCount: messages.length });

    // Get API keys from settings or environment
    const { data: settings } = await supabase
      .from('app_settings')
      .select('*')
      .limit(1)
      .single();

    let apiKey = '';
    let baseUrl = '';
    let requestModel = model;

    // Configure provider settings
    switch (provider) {
      case 'openai':
        apiKey = settings?.dangerous_openai_api_key || Deno.env.get('OPENAI_API_KEY') || '';
        baseUrl = 'https://api.openai.com/v1/chat/completions';
        break;
      case 'openrouter':
        apiKey = settings?.dangerous_openrouter_api_key || Deno.env.get('OPENROUTER_API_KEY') || '';
        baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
        break;
      case 'huggingface':
        apiKey = settings?.dangerous_huggingface_api_key || Deno.env.get('HUGGINGFACE_API_KEY') || '';
        baseUrl = 'https://api-inference.huggingface.co/models/' + model;
        break;
      default:
        throw new Error('Unsupported provider');
    }

    if (!apiKey) {
      throw new Error(`API key not found for provider: ${provider}`);
    }

    // Prepare request payload
    const payload: any = {
      model: requestModel,
      messages: messages,
      temperature: temperature || 0.7,
      stream: false
    };

    if (maxTokens && maxTokens > 0) {
      payload.max_tokens = maxTokens;
    }

    // Special handling for Hugging Face
    if (provider === 'huggingface') {
      const lastMessage = messages[messages.length - 1];
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: lastMessage.content,
          parameters: {
            temperature: temperature || 0.7,
            max_new_tokens: maxTokens || 512
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${await response.text()}`);
      }

      const data = await response.json();
      const content = data[0]?.generated_text || 'No response generated';

      return new Response(JSON.stringify({
        content,
        model: requestModel,
        provider,
        usage: {
          prompt_tokens: lastMessage.content.length / 4, // rough estimate
          completion_tokens: content.length / 4,
          total_tokens: (lastMessage.content.length + content.length) / 4
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // OpenAI/OpenRouter request
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(provider === 'openrouter' && {
          'HTTP-Referer': 'https://lovable.dev',
          'X-Title': 'Multi-Mind Companion'
        })
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`${provider} API error: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid API response format');
    }

    const content = data.choices[0].message?.content || '';
    const usage = data.usage || {};

    return new Response(JSON.stringify({
      content,
      model: requestModel,
      provider,
      usage: {
        prompt_tokens: usage.prompt_tokens || 0,
        completion_tokens: usage.completion_tokens || 0,
        total_tokens: usage.total_tokens || 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chat completion error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});