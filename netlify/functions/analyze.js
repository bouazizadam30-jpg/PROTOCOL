const axios = require('axios');

exports.handler = async (event) => {
    const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' };
    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };

    try {
        const { image } = JSON.parse(event.body);
        const apiKey = process.env.GROK_API_KEY; //

        const response = await axios.post("https://api.x.ai/v1/chat/completions", {
            model: "grok-2-vision-1212", //
            messages: [{
                role: "user",
                content: [
                    { type: "text", text: "Analyze this meal. JSON only: { 'name': '', 'kcal': 0, 'ingredients': [], 'pros': [], 'cons': [] }" },
                    { type: "image_url", image_url: { url: image } }
                ]
            }]
        }, {
            headers: { "Authorization": `Bearer ${apiKey}` }
        });

        return { statusCode: 200, headers, body: response.data.choices[0].message.content };
    } catch (error) {
        // Cela va écrire l'erreur RÉELLE dans tes logs Netlify
        console.error("ERREUR_GROK:", error.response ? error.response.data : error.message);
        return { statusCode: 500, headers, body: JSON.stringify(error) };
    }
};