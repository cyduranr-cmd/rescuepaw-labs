require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Función para hablar con la IA de Visión (OpenRouter/Gemini)
async function analizarImagen(urlImagen) {
    try {
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "google/gemini-2.0-flash-001",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analiza esta imagen. ¿Aparece un perro real en ella? Responde únicamente el objeto JSON, sin texto adicional: { \"es_perro\": true/false, \"confianza\": 1 o 2, \"motivo\": \"breve explicacion\" }" },
                        { type: "image_url", image_url: { url: urlImagen } }
                    ]
                }
            ]
        }, {
            headers: { "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}` }
        });

        let contenido = response.data.choices[0].message.content;
        
        // Limpiador de Markdown (por si la IA responde con ```json ... ```)
        contenido = contenido.replace(/```json/g, "").replace(/```/g, "").trim();
        
        return JSON.parse(contenido);
    } catch (error) {
        console.error("Error IA:", error.response?.data || error.message);
        return { 
            es_perro: false, 
            confianza: 0, 
            motivo: "No se pudo validar la imagen (Formato no soportado o error de IA)" 
        };
    }
}

// Endpoint que el Proxy consultará
app.post("/validar", async (req, res) => {
    // Usamos los nombres que envía tu agent-client.js
    const { url, metadata } = req.body; 
    
    console.log(`🧠 Agente analizando registro para: ${metadata.nombre}`);

    // Llamamos a la función de IA
    const resultado = await analizarImagen(url);

    if (!resultado.es_perro) {
        return res.json({ decision: "RECHAZAR", motivo: resultado.motivo });
    }

    res.json({
        decision: "APROBAR",
        confianza: resultado.confianza,
        motivo: "Imagen validada por OpenClaw AI"
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Agente Autónomo OpenClaw Online en puerto ${PORT}`);
});