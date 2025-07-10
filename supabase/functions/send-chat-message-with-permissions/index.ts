import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, message, user_id, notebook_id } = await req.json();
    
    console.log('Received message:', { session_id, message, user_id, notebook_id });

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user has access to this notebook
    const { data: hasAccess } = await supabase.rpc('user_has_notebook_access', {
      notebook_id: notebook_id,
      user_id: user_id
    });

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'Access denied to this notebook' }),
        { 
          status: 403,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          }
        }
      );
    }

    // Get the tags associated with this notebook
    const { data: notebookTags } = await supabase
      .from('notebook_tags')
      .select('tag_id')
      .eq('notebook_id', notebook_id);

    const tagIds = notebookTags?.map(nt => nt.tag_id) || [];

    // Get the webhook URL and auth header from environment
    const webhookUrl = Deno.env.get('NOTEBOOK_CHAT_URL');
    const authHeader = Deno.env.get('NOTEBOOK_GENERATION_AUTH');
    
    if (!webhookUrl) {
      throw new Error('NOTEBOOK_CHAT_URL environment variable not set');
    }

    if (!authHeader) {
      throw new Error('NOTEBOOK_GENERATION_AUTH environment variable not set');
    }

    console.log('Sending to webhook with auth header and tag filters');

    // Send message to n8n webhook with authentication and tag filters
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        session_id,
        message,
        user_id,
        notebook_id,
        tag_filters: tagIds,
        timestamp: new Date().toISOString()
      })
    });

    if (!webhookResponse.ok) {
      console.error(`Webhook responded with status: ${webhookResponse.status}`);
      const errorText = await webhookResponse.text();
      console.error('Webhook error response:', errorText);
      throw new Error(`Webhook responded with status: ${webhookResponse.status}`);
    }

    const webhookData = await webhookResponse.json();
    console.log('Webhook response:', webhookData);

    return new Response(
      JSON.stringify({ success: true, data: webhookData }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in send-chat-message:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send message to webhook' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});