// netlify/functions/sync-grok.js

exports.handler = async (event) => {
  // On récupère les données envoyées par ton speech.html
  const { transcript, duration } = JSON.parse(event.body);

  // Le message qu'on envoie à Grok
  const prompt = `Voici une transcription : "${transcript}". 
  L'audio dure ${duration} secondes. 
  Génère un JSON structuré pour une synchro Apple Music : 
  [{"start": 0.5, "text": "Phrase 1"}, ...]`;

  try {
    // On utilise FETCH (natif, donc rien à installer)
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROK_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "grok-beta",
        messages: [
          { role: "system", content: "Tu es un expert en synchronisation audio." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: data.choices[0].message.content
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erreur lors de l'appel à Grok" })
    };
  }
};