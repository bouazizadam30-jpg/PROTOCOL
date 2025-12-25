exports.handler = async (event) => {
    try {
        const { meals, totalKcal } = JSON.parse(event.body);
        const apiKey = process.env.GROK_API_KEY;

        // Utilisation du fetch natif (Node 18+)
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey.trim()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "grok-2-vision-1212",
                messages: [
                    { 
                        role: "system", 
                        content: "Tu es l'IA du Architect Protocol. Analyse la journée alimentaire. Sois précis, médical et froid. Réponds UNIQUEMENT en JSON." 
                    },
                    { 
                        role: "user", 
                        content: `Analyse : ${meals.map(m => m.name).join(', ')}. Total: ${totalKcal} kcal. Format: {"score": 0-10, "summary": "...", "bodyImpact": "...", "pros": "...", "cons": "..."}` 
                    }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        const content = data.choices[0].message.content.replace(/```json/g, "").replace(/```/g, "").trim();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: content
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};