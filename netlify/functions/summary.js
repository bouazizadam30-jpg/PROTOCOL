exports.handler = async (event) => {
    try {
        const { meals, totalKcal, targetKcal, profile } = JSON.parse(event.body);
        const apiKey = process.env.GROK_API_KEY;

        const prompt = `Act as Architect Protocol Coach. 
        Analyze Day: ${meals.map(m => m.name).join(', ')}. 
        Stats: ${totalKcal}kcal consumed vs ${targetKcal}kcal target.
        Objective: ${profile.objective}.
        
        Provide report in Keywords only. NO SENTENCES.
        Format JSON:
        {
          "score": 0-10,
          "status": "PERFECT / HIGH QUALITY / OFF TARGET",
          "summary": "KEYWORD1 • KEYWORD2 • KEYWORD3",
          "bodyImpact": "METABOLIC STATUS • HORMONAL RESPONSE",
          "pros": "KEYWORD • KEYWORD",
          "cons": "KEYWORD • KEYWORD"
        }`;

        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey.trim()}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "grok-2-vision-1212",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3
            })
        });

        const data = await response.json();
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: data.choices[0].message.content.replace(/```json/g, "").replace(/```/g, "").trim()
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};