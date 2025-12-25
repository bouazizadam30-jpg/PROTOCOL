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
        const apiKey = process.env.GROK_API_KEY; // Vérifié dans tes réglages

        const response = await axios.post("https://api.x.ai/v1/chat/completions", {
            model: "grok-2-vision-1212", // Modèle validé par xAI
            messages: [{
                role: "user",
                content: [
                    { type: "text", text: "Analyze this meal. Provide a JSON object: { 'name': '', 'kcal': 0, 'ingredients': [], 'pros': [], 'cons': [] }. ONLY JSON." },
                    { type: "image_url", image_url: { url: body.image } }
                ]
            }]
        }, {
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            timeout: 10000 // Évite les coupures nettes
        });

        // Nettoyage pour extraire uniquement le JSON
        let rawContent = response.data.choices[0].message.content;
        const cleanJson = rawContent.substring(rawContent.indexOf('{'), rawContent.lastIndexOf('}') + 1);

        return { statusCode: 200, headers, body: cleanJson };
    } catch (error) {
        console.error("Erreur détectée:", error.message);
        return { 
            statusCode: 500, 
            headers, 
            body: JSON.stringify({ error: "IA_TIMEOUT_OU_CRASH", details: error.message }) 
        };
    }
};