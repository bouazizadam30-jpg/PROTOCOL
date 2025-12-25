const axios = require('axios');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };

    try {
        const body = JSON.parse(event.body);
        const apiKey = process.env.GROK_API_KEY; //

        const response = await axios.post("https://api.x.ai/v1/chat/completions", {
            model: "grok-2-vision-1212", // Le bon modèle
            messages: [{
                role: "user",
                content: [
                    { type: "text", text: "Analyze this meal. Return ONLY JSON: { 'name': '', 'kcal': 0, 'ingredients': [], 'pros': [], 'cons': [] }" },
                    { type: "image_url", image_url: { url: body.image } }
                ]
            }]
        }, {
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }
        });

        // Nettoyage pour ne garder que le JSON
        let content = response.data.choices[0].message.content;
        const cleanJson = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1);

        return { statusCode: 200, headers, body: cleanJson };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: "IA_FAILED", msg: error.message }) };
    }
};