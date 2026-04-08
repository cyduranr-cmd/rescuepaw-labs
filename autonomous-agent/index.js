require("dotenv").config();
const express = require("express");
const axios = require("axios");
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const app = express();
app.use(express.json());

// Configuración de Memoria del Agente
const adapter = new FileSync('memoria_agente.json');
const db = low(adapter);
db.defaults({ registros_aprobados: [] }).write();

const PORT = process.env.PORT || 5000;

// Función de IA con Limpieza de JSON
async function analizarImagen(urlImagen, contexto) {
    try {
        const promptTexto = contexto === "alimentación" 
            ? "Analiza la imagen. ¿Aparece un perro comiendo? Responde SOLO en formato JSON: { \"es_perro\": true, \"confianza\": 95, \"motivo\": \"Se observa al canino alimentándose\" }"
            : "Analiza la imagen. ¿Es un perro real? Responde SOLO en formato JSON: { \"es_perro\": true, \"confianza\": 98, \"motivo\": \"Perro detectado correctamente\" }";

        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "google/gemini-2.0-flash-001",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: promptTexto },
                        { type: "image_url", image_url: { url: urlImagen } }
                    ]
                }
            ],
            response_format: { type: "json_object" } 
        }, {
            headers: { "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}` }
        });

        let contenido = response.data.choices[0].message.content;
        return JSON.parse(contenido.replace(/```json/g, "").replace(/```/g, "").trim());
    } catch (error) {
        console.error("❌ Error IA:", error.message);
        return { es_perro: false, confianza: 0, motivo: "Error de visión o formato" };
    }
}

app.post("/validar", async (req, res) => {
    try {
        const { url, metadata, contexto } = req.body; 
        if (!metadata) return res.status(400).json({ decision: "RECHAZAR", motivo: "Faltan metadatos" });

        console.log(`🧠 Agente analizando ${contexto} para: ${metadata.nombre}`);

        // 1. FILTRO DE DUPLICADOS
        if (contexto === "registro") {
            const padrino = (metadata.padrino || "").toLowerCase();
            const raza = (metadata.raza || "").toLowerCase();
            const distrito = (metadata.distrito || "").toLowerCase();

            const existe = db.get('registros_aprobados').find({ padrino, raza, distrito }).value();
            if (existe) {
                return res.json({ decision: "RECHAZAR", motivo: "Duplicado detectado en la misma zona." });
            }
        }

        // 2. VALIDACIÓN IA
        const resultado = await analizarImagen(url, contexto); 
        if (!resultado.es_perro) return res.json({ decision: "RECHAZAR", motivo: resultado.motivo });

        // 3. GUARDAR MEMORIA
        if (contexto === "registro") {
            db.get('registros_aprobados').push({ 
                padrino: (metadata.padrino || "").toLowerCase(),
                raza: (metadata.raza || "").toLowerCase(),
                distrito: (metadata.distrito || "").toLowerCase(),
                fecha: new Date().toISOString()
            }).write();
        }

        res.json({ decision: "APROBAR", confianza: resultado.confianza, motivo: resultado.motivo });

    } catch (error) {
        console.error("❌ Error 500:", error.message);
        res.status(500).json({ decision: "RECHAZAR", motivo: "Error interno del Agente" });
    }
});

app.listen(PORT, () => console.log(`🚀 Agente Online en puerto ${PORT}`));