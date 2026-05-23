import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FALLBACK_MESSAGES = [
  'Um novo dia, uma nova oportunidade de fazer a diferença.',
  'Pequenos passos levam a grandes conquistas.',
  'A inclusão começa com a empatia.',
  'Cada pessoa tem um potencial único a ser descoberto.',
  'Diversidade é a nossa maior força.',
  'Hoje é um bom dia para criar impacto positivo.',
  'Conexões verdadeiras transformam vidas.',
  'O conhecimento compartilhado multiplica oportunidades.',
]

async function fetchMotivationalMessage(): Promise<string> {
  try {
    const response = await fetch('https://api.quotable.io/random?maxLength=100')
    if (response.ok) {
      const data = await response.json()
      return `${data.content} — ${data.author}`
    }
  } catch (error) {
    console.log('API externa indisponível, usando fallback')
  }
  
  return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const message = await fetchMotivationalMessage()

    const { error: insertError } = await supabase
      .from('system_heartbeats')
      .insert({
        message,
        source: 'cron',
        metadata: { timestamp: new Date().toISOString() }
      })

    if (insertError) throw insertError

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    await supabase
      .from('system_heartbeats')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString())

    console.log(`[keep-alive] Heartbeat registrado: ${message.substring(0, 50)}...`)

    return new Response(
      JSON.stringify({ success: true, message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[keep-alive] Erro:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
