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
    const { message } = await req.json();
    
    console.log('Generate title request for message:', message.substring(0, 100));

    // Get settings to determine which model to use for title generation
    const { data: settings } = await supabase
      .from('app_settings')
      .select('*')
      .limit(1)
      .single();

    const titleModel = settings?.utility_title_model || 'anthropic/claude-3-haiku';
    const provider = settings?.chat_using || 'openrouter';
    
    let apiKey = '';
    let baseUrl = '';

    switch (provider) {
      case 'openai':
        apiKey = settings?.dangerous_openai_api_key || Deno.env.get('OPENAI_API_KEY') || '';
        baseUrl = 'https://api.openai.com/v1/chat/completions';
        break;
      case 'openrouter':
        apiKey = settings?.dangerous_openrouter_api_key || Deno.env.get('OPENROUTER_API_KEY') || '';
        baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
        break;
      default:
        // Fallback to simple extraction
        const words = message.split(' ').slice(0, 5).join(' ');
        return new Response(JSON.stringify({ 
          title: words.length > 30 ? words.substring(0, 30) + '...' : words 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    if (!apiKey) {
      // Fallback to simple extraction
      const words = message.split(' ').slice(0, 5).join(' ');
      return new Response(JSON.stringify({ 
        title: words.length > 30 ? words.substring(0, 30) + '...' : words 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
      body: JSON.stringify({
        model: titleModel,
        messages: [
          {
            role: 'system',
            content: 'Generate a short, concise title (max 5 words) for the following message. Only return the title, nothing else.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.3,
        max_tokens: 20
      }),
    });

    if (!response.ok) {
      console.error('Title generation API error:', await response.text());
      // Fallback to simple extraction
      const words = message.split(' ').slice(0, 5).join(' ');
      return new Response(JSON.stringify({ 
        title: words.length > 30 ? words.substring(0, 30) + '...' : words 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const title = data.choices?.[0]?.message?.content?.trim() || 'New Chat';

    return new Response(JSON.stringify({ title }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Title generation error:', error);
    // Fallback to timestamp-based title
    return new Response(JSON.stringify({ 
      title: `Chat ${new Date().toLocaleDateString()}` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});