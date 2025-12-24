exports.handler = async (event) => {
    try {
        const apiKey = process.env.GROK_API_KEY;
        const { transcript, duration } = JSON.parse(event.body);

        // On s'assure que duration est un nombre valide
        const cleanDuration = isNaN(duration) ? 15 : duration;

        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey.trim()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "grok-beta",
                messages: [
                    { role: "system", content: "Tu es un expert en synchronisation. Réponds UNIQUEMENT avec un tableau JSON." },
                    { role: "user", content: `Synchronise : "${transcript}" sur ${cleanDuration}s.` }
                ],
                temperature: 0
            })
        });

        const data = await response.json();

        // SI GROK RENVOIE UNE ERREUR (C'est ici que ça se joue)
        if (!response.ok || data.error) {
            console.error("DÉTAIL ERREUR GROK:", JSON.stringify(data.error || data));
            return { 
                statusCode: response.status, 
                body: JSON.stringify({ error: "Grok Error", details: data.error }) 
            };
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: data.choices[0].message.content.replace(/```json/g, "").replace(/```/g, "").trim()
        };

    } catch (error) {
        console.error("CRASH FONCTION:", error.message);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};