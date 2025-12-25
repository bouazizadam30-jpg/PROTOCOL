const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors()); 
app.use(express.json({ limit: '50mb' })); 

const GROK_API_KEY = "xai-Kj0egL3jgvawSqk76oA4c5vQLj8aJ2vJ81urAY00jhp5VP5kyDc5NrFv3m9EnzTfKKspsozUVp8jBU4b";

app.post('/analyze', async (req, res) => {
    try {
        const response = await axios.post("https://api.x.ai/v1/chat/completions", {
            model: "grok-2-vision-1212", // Correction du nom du modèle ici
            messages: [
                {
                    role: "user",
                    content: [
                        { 
                          type: "text", 
                          text: "Analyze this meal. Provide a JSON object with: 'name' (string), 'kcal' (number), 'ingredients' (array), 'pros' (array), 'cons' (array). Return ONLY pure JSON." 
                        },
                        { type: "image_url", image_url: { url: req.body.image } }
                    ]
                }
            ],
            temperature: 0
        }, {
            headers: {
                "Authorization": `Bearer ${GROK_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        // Nettoyage de la réponse
        let content = response.data.choices[0].message.content.replace(/```json|```/g, "").trim();
        res.json(JSON.parse(content));
        
    } catch (error) {
        console.error("Détails Erreur Grok:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "L'analyse a échoué." });
    }
});

app.listen(3000, () => console.log(">>> ARCHITECT SERVER ONLINE [PORT 3000]"));