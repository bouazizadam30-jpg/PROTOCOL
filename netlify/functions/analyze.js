const axios = require('axios');

exports.handler = async (event, context) => {
    // Autoriser les requêtes depuis ton site
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };

    try {
        const { image } = JSON.parse(event.body);
        // ON UTILISE UNE VARIABLE D'ENVIRONNEMENT (SÉCURITÉ)
        const GROK_API_KEY = process.env.GROK_API_KEY;

        const response = await axios.post("https://api.x.ai/v1/chat/completions", {
            model: "grok-2-vision-1212",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analyze this meal. Return ONLY JSON: { 'name': '', 'kcal': 0, 'ingredients': [], 'pros': [], 'cons': [] }" },
                        { type: "image_url", image_url: { url: image } }
                    ]
                }
            ],
            temperature: 0
        }, {
            headers: { "Authorization": `Bearer ${GROK_API_KEY}`, "Content-Type": "application/json" }
        });

        const content = response.data.choices[0].message.content.replace(/```json|```/g, "").trim();
        return {
            statusCode: 200,
            headers,
            body: content
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: "IA_OFFLINE" }) };
    }
};