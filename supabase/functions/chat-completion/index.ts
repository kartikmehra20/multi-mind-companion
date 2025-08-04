import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Debug logging for environment variables
console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
console.log('SUPABASE_URL:', Deno.env.get('SUPABASE_URL') ? 'SET' : 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'SET' : 'MISSING');
console.log('OPENROUTER_API_KEY:', Deno.env.get('OPENROUTER_API_KEY') ? 'SET' : 'MISSING');
console.log('OPENAI_API_KEY:', Deno.env.get('OPENAI_API_KEY') ? 'SET' : 'MISSING');
console.log('HUGGINGFACE_API_KEY:', Deno.env.get('HUGGINGFACE_API_KEY') ? 'SET' : 'MISSING');
console.log('=====================================');

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('CRITICAL: Missing required Supabase environment variables');
  console.error('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING');
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

serve(async (req) => {
  console.log('=== CHAT COMPLETION REQUEST START ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body received:', {
        messagesCount: requestBody.messages?.length,
        threadId: requestBody.threadId,
        model: requestBody.model,
        provider: requestBody.provider,
        hasApiKeys: !!requestBody.apiKeys
      });
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: parseError.message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { messages, threadId, model, provider, temperature, maxTokens, apiKeys } = requestBody;
    
    // Validate required parameters
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('Invalid messages parameter:', messages);
      return new Response(
        JSON.stringify({ error: 'Messages array is required and cannot be empty' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!model || !provider) {
      console.error('Missing required parameters - model:', model, 'provider:', provider);
      return new Response(
        JSON.stringify({ error: 'Model and provider are required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Chat completion request validated:', { threadId, model, provider, messagesCount: messages.length });

    // Get API keys from settings or from the request (local storage)
    let settings = null;
    try {
      const { data: settingsData, error: settingsError } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Error fetching settings:', settingsError);
      } else {
        settings = settingsData;
        console.log('Settings loaded successfully');
      }
    } catch (settingsError) {
      console.error('Exception fetching settings:', settingsError);
    }

    let apiKey = '';
    let baseUrl = '';
    let requestModel = model;

    // First try to get API key from request (local storage), then from settings, then from env
    switch (provider) {
      case 'openai':
        apiKey = apiKeys?.openai || settings?.dangerous_openai_api_key || Deno.env.get('OPENAI_API_KEY') || '';
        baseUrl = 'https://api.openai.com/v1/chat/completions';
        break;
      case 'openrouter':
        apiKey = apiKeys?.openrouter || settings?.dangerous_openrouter_api_key || Deno.env.get('OPENROUTER_API_KEY') || '';
        baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
        break;
      case 'huggingface':
        apiKey = apiKeys?.huggingface || settings?.dangerous_huggingface_api_key || Deno.env.get('HUGGINGFACE_API_KEY') || '';
        baseUrl = 'https://api-inference.huggingface.co/models/' + model;
        break;
      default:
        console.error('Unsupported provider:', provider);
        return new Response(
          JSON.stringify({ error: `Unsupported provider: ${provider}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

    console.log('API Key status for', provider, ':', apiKey ? 'AVAILABLE' : 'MISSING');
    console.log('Base URL:', baseUrl);

    if (!apiKey) {
      console.error(`API key not found for provider: ${provider}`);
      return new Response(
        JSON.stringify({ 
          error: `API key not found for provider: ${provider}`,
          details: 'Please configure API key in settings or provide it in the request'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
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

    console.log('Prepared payload:', {
      model: payload.model,
      messagesCount: payload.messages.length,
      temperature: payload.temperature,
      maxTokens: payload.max_tokens
    });

    // Special handling for Hugging Face
    if (provider === 'huggingface') {
      console.log('Processing Hugging Face request');
      const lastMessage = messages[messages.length - 1];
      
      try {
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

        console.log('Hugging Face response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Hugging Face API error:', errorText);
          return new Response(
            JSON.stringify({ 
              error: `Hugging Face API error: ${response.status}`,
              details: errorText
            }),
            { 
              status: response.status, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const data = await response.json();
        console.log('Hugging Face response received');
        
        const content = data[0]?.generated_text || 'No response generated';

        const result = {
          content,
          model: requestModel,
          provider,
          usage: {
            prompt_tokens: Math.ceil(lastMessage.content.length / 4), // rough estimate
            completion_tokens: Math.ceil(content.length / 4),
            total_tokens: Math.ceil((lastMessage.content.length + content.length) / 4)
          }
        };

        console.log('Returning Hugging Face result');
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (hfError) {
        console.error('Hugging Face request failed:', hfError);
        return new Response(
          JSON.stringify({ 
            error: 'Hugging Face request failed',
            details: hfError.message
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // OpenAI/OpenRouter request
    console.log('Processing OpenAI/OpenRouter request');
    try {
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

      console.log(`${provider} response status:`, response.status);
      console.log(`${provider} response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`${provider} API error:`, errorText);
        return new Response(
          JSON.stringify({ 
            error: `${provider} API error: ${response.status}`,
            details: errorText
          }),
          { 
            status: response.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const data = await response.json();
      console.log(`${provider} response received, choices:`, data.choices?.length);
      
      if (!data.choices || !data.choices[0]) {
        console.error('Invalid API response format:', data);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid API response format',
            details: 'No choices in response'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const content = data.choices[0].message?.content || '';
      const usage = data.usage || {};

      const result = {
        content,
        model: requestModel,
        provider,
        usage: {
          prompt_tokens: usage.prompt_tokens || 0,
          completion_tokens: usage.completion_tokens || 0,
          total_tokens: usage.total_tokens || 0
        }
      };

      console.log('Returning successful result');
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (apiError) {
      console.error(`${provider} request failed:`, apiError);
      return new Response(
        JSON.stringify({ 
          error: `${provider} request failed`,
          details: apiError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('=== CHAT COMPLETION ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=============================');
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        type: error.constructor.name
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } finally {
    console.log('=== CHAT COMPLETION REQUEST END ===');
  }
});