exports.handler = async (event) => {
    try {
        const { meals, totalKcal, targetKcal, profile } = JSON.parse(event.body);
        const apiKey = process.env.GROK_API_KEY;

        const prompt = `Act as Architect Neuro-Nutritionist. 
        Analyze BIOMASS: ${meals.map(m => m.name).join(', ')}. 
        Stats: ${totalKcal}kcal vs ${targetKcal}kcal target.
        
        Estimate Neuro-Hormonal Impact (0-100%):
        - DOPAMINE: Based on Tyrosine/Protein/Caffeine.
        - SEROTONIN: Based on Tryptophan/Carb-Ratio/B6.
        - TESTOSTERONE: Based on Healthy Fats/Zinc/Magnesium/CICO.

        Format JSON:
        {
          "score": 0-10,
          "status": "STATUS_KEYWORD",
          "summary": "KEYWORD1 • KEYWORD2",
          "neural": {
            "dopamine": 0-100,
            "serotonin": 0-100,
            "testo": 0-100
          },
          "metabolic": "METABOLIC_KEYWORD • GLYCEMIC_LOAD",
          "pros": "KEYWORD • KEYWORD",
          "cons": "KEYWORD • KEYWORD"
        }`;

        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey.trim()}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "grok-2-vision-1212",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.2
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