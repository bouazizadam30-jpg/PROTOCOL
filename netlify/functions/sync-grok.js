exports.handler = async (event) => {
    try {
        const apiKey = process.env.GROK_API_KEY;
        const { transcript, duration } = JSON.parse(event.body);
        const cleanDuration = isNaN(duration) ? 15 : duration;

        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey.trim()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "grok-3", // CHANGEMENT ICI : grok-beta -> grok-3
                messages: [
                    { role: "system", content: "Tu es un expert en synchronisation audio. Réponds UNIQUEMENT avec un tableau JSON [{\"start\": float, \"text\": string}]. Pas de texte, pas de markdown." },
                    { role: "user", content: `Synchronise ce texte : "${transcript}" sur une durée totale de ${cleanDuration} secondes.` }
                ],
                temperature: 0
            })
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            console.error("DÉTAIL ERREUR GROK:", JSON.stringify(data.error || data));
            return { 
                statusCode: response.status, 
                body: JSON.stringify({ error: "Grok Error", details: data.error }) 
            };
        }

        // Nettoyage des balises Markdown au cas où
        let content = data.choices[0].message.content.trim();
        content = content.replace(/```json/g, "").replace(/```/g, "").trim();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: content
        };

    } catch (error) {
        console.error("CRASH FONCTION:", error.message);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};