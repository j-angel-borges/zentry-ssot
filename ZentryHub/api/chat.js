export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({
      reply: '⚠️ El agente IA no está configurado. Configura la variable GOOGLE_AI_API_KEY en el panel de Vercel (Settings → Environment Variables).',
      suggestions: []
    });
  }
  
  try {
    const { message, currentDate, existingBlocks, calendarEvents } = req.body;
    
    const systemPrompt = `Eres Zentry AI, un asistente de productividad personal integrado en el dashboard de ZentryOS.

Tu rol principal es ayudar a organizar el día del usuario rellenando bloques de tiempo (timeblocking) de 15 minutos.

CONTEXTO DEL PROYECTO ZENTRYOS:
- ZentryOS es un sistema operativo de bienestar digital para familias
- Actualmente en fase MVP con 4 verticales: Visión/Producto, Arquitectura Técnica, Marketing/Ventas, Operaciones/Roadmap
- Stack técnico: Android Kiosk Mode, Jetpack Compose, Firestore, Gemini SDK, Google Apps Script
- Equipo: Jose Angel (fundador/desarrollador principal) + Agentes de IA

TAREAS PRIORITARIAS DEL ROADMAP:
- Implementar barra circadiana superpuesta (Timer UI Overlay) en Jetpack Compose
- Desarrollar lógica de límites de tiempo dinámicos
- Finalizar Demo Venta Directa con factor WOW
- Configurar telemetría GCP y pipeline BigQuery
- Preparar Expo Maternidad (estrategia comercial)

INSTRUCCIONES:
1. Cuando el usuario pida organizar su día, genera sugerencias de timeblock en formato JSON.
2. Considera los eventos existentes del calendario y bloques ya ocupados.
3. Intercala trabajo profundo con descansos cortos (técnica Pomodoro adaptada).
4. Prioriza las tareas del roadmap de ZentryOS.
5. Responde siempre en español.
6. Sé conciso y práctico.

FORMATO DE RESPUESTA:
Siempre responde con JSON válido con esta estructura:
{
  "reply": "Tu mensaje conversacional aquí",
  "suggestions": [
    { "time": "HH:MM", "text": "Descripción de la actividad" }
  ]
}

Si no hay sugerencias de timeblock (por ejemplo, si el usuario solo hace una pregunta), deja suggestions como array vacío [].
El campo "time" debe usar formato 24h (ej: "09:00", "14:30").
Cada sugerencia ocupa exactamente UN slot de 15 minutos. Para actividades más largas, crea múltiples slots consecutivos.

FECHA ACTUAL: ${currentDate || new Date().toISOString().split('T')[0]}
BLOQUES EXISTENTES HOY: ${JSON.stringify(existingBlocks || {})}
EVENTOS DE CALENDARIO: ${JSON.stringify(calendarEvents || [])}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: message }] }
          ],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      }
    );
    
    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', errText);
      return res.status(502).json({
        reply: '⚠️ Error al comunicarse con Gemini. Intenta de nuevo en un momento.',
        suggestions: []
      });
    }
    
    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!rawText) {
      return res.status(502).json({
        reply: '⚠️ No se recibió respuesta del modelo. Intenta reformular tu mensaje.',
        suggestions: []
      });
    }
    
    try {
      const parsed = JSON.parse(rawText);
      return res.status(200).json({
        reply: parsed.reply || rawText,
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
      });
    } catch (parseErr) {
      // If Gemini didn't return valid JSON, wrap the text
      return res.status(200).json({
        reply: rawText,
        suggestions: []
      });
    }
  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(500).json({
      reply: '⚠️ Error interno del servidor. Intenta de nuevo.',
      suggestions: []
    });
  }
}
