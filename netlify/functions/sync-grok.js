exports.handler = async (event) => {
    try {
        const { transcript, duration } = JSON.parse(event.body);
        const apiKey = process.env.GROK_API_KEY;

        if (!apiKey) {
            return { statusCode: 500, body: JSON.stringify({ error: "Clé GROK_API_KEY manquante dans Netlify" }) };
        }

        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey.trim()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "grok-beta",
                messages: [
                    { role: "system", content: "Réponds UNIQUEMENT avec un tableau JSON de synchronisation audio. Pas de texte, pas de markdown." },
                    { role: "user", content: `Texte: "${transcript}". Durée: ${duration}s.` }
                ],
                temperature: 0
            })
        });

        const data = await response.json();

        // Si l'API renvoie une erreur (crédits épuisés ou clé invalide)
        if (data.error) {
            return { statusCode: 500, body: JSON.stringify({ error: "Erreur API xAI: " + data.error.message }) };
        }

        if (!data.choices || !data.choices[0]) {
            return { statusCode: 500, body: JSON.stringify({ error: "Réponse vide de Grok", fullResponse: data }) };
        }

        let content = data.choices[0].message.content.trim();
        content = content.replace(/```json/g, "").replace(/```/g, "").trim();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: content
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: "Crash serveur: " + error.message }) };
    }
};