exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { prompt, planLang } = JSON.parse(event.body);

  const systemPrompt = `Eres un fisioterapeuta y entrenador personal experto. Tu tarea es generar planes de ejercicio personalizados y seguros.
Responde SOLO con un objeto JSON válido, sin texto adicional, sin bloques de código markdown.
El JSON debe tener exactamente esta estructura:
{
  "nombre": "string - nombre del plan",
  "categoria": "string",
  "frecuencia": "string - ej: 3 días / semana",
  "notas": "string - notas de seguridad personalizadas para el paciente (2-3 frases)",
  "ejercicios": [
    {
      "nombre": "string",
      "icono": "string - un emoji relevante",
      "tiempo": "string o null - ej: 3 min",
      "repeticiones": "string o null - ej: 12 reps x 3",
      "beneficio": "string - beneficio principal en una frase corta",
      "instrucciones": ["string", "string", "string", "string"],
      "logro": "string - frase motivadora corta con emoji al completar"
    }
  ]
}
Genera entre 5 y 8 ejercicios. Responde en ${planLang}. Los ejercicios deben ser seguros, progresivos y adaptados exactamente al perfil descrito.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Genera un plan de ejercicios para este paciente: ${prompt}` }]
    })
  });

  const data = await response.json();
  const text = data.content.map(b => b.text || '').join('');

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ result: text })
  };
};
