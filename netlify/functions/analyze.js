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
        const apiKey = process.env.GROK_API_KEY;

        const response = await axios.post("https://api.x.ai/v1/chat/completions", {
            model: "grok-2-vision-1212", // Modèle validé
            messages: [{
                role: "user",
                content: [
                    { 
                        type: "text", 
                        text: "Analyze this meal. Provide a JSON object with: 'name' (string), 'kcal' (number), 'ingredients' (array), 'pros' (array), 'cons' (array). Return ONLY pure JSON, no other text." 
                    },
                    { type: "image_url", image_url: { url: body.image } }
                ]
            }],
            temperature: 0
        }, {
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }
        });

        // NETTOYAGE ULTRA-ROBUSTE DU JSON
        let content = response.data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/); // Trouve le premier { et le dernier }
        
        if (!jsonMatch) throw new Error("Format_IA_Invalide");

        return {
            statusCode: 200,
            headers,
            body: jsonMatch[0]
        };

    } catch (error) {
        console.error("Erreur Détail:", error.response ? error.response.data : error.message);
        return { 
            statusCode: 500, 
            headers, 
            body: JSON.stringify({ error: "Echec de l'analyse", details: error.message }) 
        };
    }
};