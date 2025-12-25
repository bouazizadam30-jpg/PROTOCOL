const axios = require('axios');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };

    try {
        const { image } = JSON.parse(event.body);
        // On récupère la clé depuis les secrets de Netlify
        const apiKey = process.env.GROK_API_KEY;

        const response = await axios.post("https://api.x.ai/v1/chat/completions", {
            model: "grok-2-vision-1212", // Correction du nom de modèle
            messages: [{
                role: "user",
                content: [
                    { type: "text", text: "Analyze this meal. Return ONLY a JSON object: { 'name': '', 'kcal': 0, 'ingredients': [], 'pros': [], 'cons': [] }" },
                    { type: "image_url", image_url: { url: image } }
                ]
            }],
            temperature: 0
        }, {
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }
        });

        const aiResult = response.data.choices[0].message.content.replace(/```json|```/g, "").trim();
        return { statusCode: 200, headers, body: aiResult };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: "IA_OFFLINE" }) };
    }
};