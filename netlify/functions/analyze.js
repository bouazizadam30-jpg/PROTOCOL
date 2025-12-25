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

        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "grok-2-vision-1212", //
                messages: [{
                    role: "user",
                    content: [
                        { type: "text", text: "Analyze this meal. JSON only: { 'name': '', 'kcal': 0, 'ingredients': [], 'pros': [], 'cons': [] }" },
                        { type: "image_url", image_url: { url: body.image } }
                    ]
                }]
            })
        });

        const data = await response.json();
        const content = data.choices[0].message.content.replace(/```json|```/g, "").trim();

        return { statusCode: 200, headers, body: content };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};