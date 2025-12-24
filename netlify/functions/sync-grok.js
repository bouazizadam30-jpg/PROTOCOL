exports.handler = async (event) => {
  try {
    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "Clé API introuvable. Vérifie Netlify." }) };
    }

    const { transcript, duration } = JSON.parse(event.body);

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "grok-beta",
        messages: [
          { role: "system", content: "Génère un tableau JSON pur de synchro audio." },
          { role: "user", content: `Texte: "${transcript}". Durée: ${duration}s.` }
        ]
      })
    });

    const data = await response.json();

    // SI L'API RENVOIE UNE ERREUR, ON RENVOIE TOUT L'OBJET POUR COMPRENDRE
    if (data.error) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ 
          error: "Erreur xAI", 
          details: data.error // C'est ici qu'on verra le vrai message (ex: "Balance trop basse")
        }) 
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: data.choices[0].message.content.replace(/```json/g, "").replace(/```/g, "").trim()
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: "Crash: " + error.message }) };
  }
};