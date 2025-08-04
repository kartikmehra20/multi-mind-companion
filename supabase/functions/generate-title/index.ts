import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Debug logging for environment variables
console.log('=== GENERATE TITLE ENV DEBUG ===');
console.log('SUPABASE_URL:', Deno.env.get('SUPABASE_URL') ? 'SET' : 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'SET' : 'MISSING');
console.log('OPENROUTER_API_KEY:', Deno.env.get('OPENROUTER_API_KEY') ? 'SET' : 'MISSING');
console.log('OPENAI_API_KEY:', Deno.env.get('OPENAI_API_KEY') ? 'SET' : 'MISSING');
console.log('================================');

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('CRITICAL: Missing required Supabase environment variables');
  console.error('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING');
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

serve(async (req) => {
  console.log('=== GENERATE TITLE REQUEST START ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);

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
        messageLength: requestBody.message?.length,
        messagePreview: requestBody.message?.substring(0, 100)
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

    const { message } = requestBody;
    
    if (!message || typeof message !== 'string') {
      console.error('Invalid message parameter:', message);
      return new Response(
        JSON.stringify({ error: 'Message is required and must be a string' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Generate title request for message:', message.substring(0, 100));

    // Get settings to determine which model to use for title generation
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
        console.log('Settings loaded for title generation');
      }
    } catch (settingsError) {
      console.error('Exception fetching settings:', settingsError);
    }

    const titleModel = settings?.utility_title_model || 'anthropic/claude-3-haiku';
    const provider = settings?.chat_using || 'openrouter';
    
    console.log('Using title model:', titleModel, 'with provider:', provider);
    
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
        console.log('Unsupported provider for title generation, using fallback');
        // Fallback to simple extraction
        const words = message.split(' ').slice(0, 5).join(' ');
        const fallbackTitle = words.length > 30 ? words.substring(0, 30) + '...' : words;
        console.log('Fallback title generated:', fallbackTitle);
        return new Response(JSON.stringify({ title: fallbackTitle }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    console.log('API Key status for title generation:', apiKey ? 'AVAILABLE' : 'MISSING');

    if (!apiKey) {
      console.log('No API key available, using fallback title generation');
      // Fallback to simple extraction
      const words = message.split(' ').slice(0, 5).join(' ');
      const fallbackTitle = words.length > 30 ? words.substring(0, 30) + '...' : words;
      console.log('Fallback title generated:', fallbackTitle);
      return new Response(JSON.stringify({ title: fallbackTitle }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      console.log('Making API request for title generation');
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

      console.log('Title generation API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Title generation API error:', errorText);
        // Fallback to simple extraction
        const words = message.split(' ').slice(0, 5).join(' ');
        const fallbackTitle = words.length > 30 ? words.substring(0, 30) + '...' : words;
        console.log('Using fallback title due to API error:', fallbackTitle);
        return new Response(JSON.stringify({ title: fallbackTitle }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json();
      const title = data.choices?.[0]?.message?.content?.trim() || 'New Chat';

      console.log('Generated title:', title);
      return new Response(JSON.stringify({ title }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (apiError) {
      console.error('Title generation API request failed:', apiError);
      // Fallback to simple extraction
      const words = message.split(' ').slice(0, 5).join(' ');
      const fallbackTitle = words.length > 30 ? words.substring(0, 30) + '...' : words;
      console.log('Using fallback title due to request failure:', fallbackTitle);
      return new Response(JSON.stringify({ title: fallbackTitle }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('=== GENERATE TITLE ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('============================');
    
    // Fallback to timestamp-based title
    const fallbackTitle = `Chat ${new Date().toLocaleDateString()}`;
    console.log('Using timestamp fallback title:', fallbackTitle);
    return new Response(JSON.stringify({ title: fallbackTitle }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } finally {
    console.log('=== GENERATE TITLE REQUEST END ===');
  }
});