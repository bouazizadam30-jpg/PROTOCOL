const fetch = require('node-fetch');

exports.handler = async (event) => {
    const { meals, totalKcal } = JSON.parse(event.body);
    const apiKey = process.env.GROK_API_KEY;

    const prompt = `En tant qu'intelligence artificielle du Architect Protocol, analyse cette journée alimentaire :
    Repas : ${meals.map(m => m.name).join(', ')}
    Total Calories : ${totalKcal} kcal.
    
    Réponds UNIQUEMENT avec ce JSON :
    {
      "score": nombre sur 10,
      "summary": "résumé court et tranchant",
      "bodyImpact": "ce qui arrive au corps (insuline, muscles, cerveau)",
      "pros": "points forts",
      "cons": "points faibles"
    }`;

    try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "grok-2-vision-1212",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });

        const data = await response.json();
        return {
            statusCode: 200,
            body: data.choices[0].message.content
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};