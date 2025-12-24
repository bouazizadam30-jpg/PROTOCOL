// netlify/functions/sync-grok.js

exports.handler = async (event) => {
  try {
    const { transcript, duration } = JSON.parse(event.body);

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROK_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "grok-beta",
        messages: [
          { 
            role: "system", 
            content: "Tu es un extracteur de données. Tu dois générer UNIQUEMENT un tableau JSON pur, sans texte avant ou après, sans balises Markdown (pas de ```json). Format: [{\"start\": float, \"text\": string}]" 
          },
          { 
            role: "user", 
            content: `Synchronise ce texte sur une durée de ${duration} secondes : "${transcript}"` 
          }
        ],
        temperature: 0 // On met à 0 pour éviter que l'IA ne devienne créative
      })
    });

    const data = await response.json();
    let content = data.choices[0].message.content.trim();

    // NETTOYAGE DE SÉCURITÉ : On enlève les balises Markdown si Grok en met quand même
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: content // On renvoie directement le contenu nettoyé
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};