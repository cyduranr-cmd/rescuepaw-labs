require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require("discord.js");
const { obtenerRespuestaIA } = require("./ai");
// Importamos ambas funciones desde blockchain.js
const { registrarEnBlockchain, obtenerDatosPerro } = require("./blockchain"); 
const { consultarAgente } = require("./agent-client");
const { deployCommands } = require("./commands");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent 
    ]
});

client.once("ready", async () => {
    console.log(`🤖 Proxy AI Online: ${client.user.tag}`);
    try {
        console.log("🚀 Registrando comandos en Discord...");
        await deployCommands(); 
        console.log("✅ ¡Comandos registrados y listos!");
    } catch (error) {
        console.error("❌ Error al registrar comandos:", error);
    }
    client.user.setActivity("zkSYS Testnet 🐾", { type: ActivityType.Watching });
});

// --- ESCUCHADOR DE MENCIONES (@bot) ---
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.mentions.has(client.user)) {
        const prompt = message.content.replace(`<@${client.user.id}>`, "").trim();
        if (!prompt) return message.reply("¡Hola! Soy el Proxy de RescuePaw. ¿En qué puedo ayudarte hoy? 🐕");

        await message.channel.sendTyping();
        const respuesta = await obtenerRespuestaIA(prompt);
        await message.reply(respuesta);
    }
});

// --- ESCUCHADOR DE COMANDOS ---
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // --- COMANDO: REGISTRAR ---
    if (interaction.commandName === "registrar_perro") {
        await interaction.deferReply({ ephemeral: false });
        try {
            const datos = {
                nombre: interaction.options.getString("nombre"),
                raza: interaction.options.getString("raza"),
                color: interaction.options.getString("color"),
                tamano: interaction.options.getString("tamano"),
                distrito: interaction.options.getString("distrito"),
                zona: interaction.options.getString("zona"),
                padrino: interaction.options.getString("wallet_padrino")
            };
            
            const foto = interaction.options.getAttachment("foto");
            if (!foto) return interaction.editReply("❌ Debes incluir una foto.");

            const veredicto = await consultarAgente(foto.url, datos);
            if (veredicto.decision === "RECHAZAR") {
                return interaction.editReply(`❌ Bloqueado por seguridad: ${veredicto.motivo}`);
            }

            const tx = await registrarEnBlockchain(datos, foto.url, veredicto.confianza);
            await interaction.editReply(`✅ ¡Perro en Blockchain! \n🔗 **Hash:** \`${tx.hash}\` \n🐾 **Nombre:** ${datos.nombre}`);

        } catch (error) {
            console.error("❌ Error en el proceso:", error);
            await interaction.editReply(`❌ Hubo un error: ${error.message || "Revisa la terminal."}`);
        }
    }

    // COMANDO: VER PERRO (FASE 5) ---
    if (interaction.commandName === "ver_perro") {
        await interaction.deferReply();
        const id = interaction.options.getInteger("id");

        try {
            const datos = await obtenerDatosPerro(id);

            // Creamos una tarjeta visual elegante
            const embed = new EmbedBuilder()
                .setTitle(`🐾 Ficha de Rescate: ${datos.nombre}`)
                .setColor(datos.confianza >= 2 ? 0x2ecc71 : 0xf1c40f) // Verde si es alta confianza, amarillo si es media
                .setThumbnail(datos.fotoUrl)
                .addFields(
                    { name: "🆔 ID", value: id.toString(), inline: true },
                    { name: "🐕 Raza", value: datos.raza, inline: true },
                    { name: "📍 Distrito", value: datos.distrito, inline: true },
                    { name: "🛡️ Confianza IA", value: datos.confianza >= 2 ? "⭐⭐ Alta" : "⭐ Media", inline: true },
                    { name: "💰 Fondos", value: `${datos.fondos} TSYS`, inline: true },
                    { name: "👤 Padrino", value: `\`${datos.padrino.substring(0, 6)}...${datos.padrino.substring(38)}\``, inline: true }
                )
                .setImage(datos.fotoUrl)
                .setFooter({ text: "Datos validados por Agente IA en zkSYS" })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("❌ Error al consultar:", error);
            await interaction.editReply(`❌ No se encontró el perro con ID **${id}** o hay un problema de red.`);
        }
    }

    // --- COMANDO: DONAR ---
    if (interaction.commandName === "donar") {
        const id = interaction.options.getInteger("id");
        
        const embedDonar = new EmbedBuilder()
            .setTitle("🙌 ¡Ayuda a un Rescatado!")
            .setColor(0x3498db)
            .setDescription(`Estás consultando cómo donar al perrito con **ID: ${id}**`)
            .addFields(
                { name: "🔑 Dirección del Contrato", value: `\`${process.env.CONTRACT_ADDRESS}\`` },
                { name: "🌐 Red", value: "Syscoin NEVM Testnet (Tanenbaum)", inline: true },
                { name: "🪙 Moneda", value: "TSYS", inline: true },
                { 
                    name: "⚖️ Política de Transparencia", 
                    value: "El Agente supervisa la distribución: **95%** para el rescatista / **5%** para mantenimiento de la IA." 
                },
                { name: "📝 Nota de Donación", value: `En tu Pali Wallet, puedes incluir el ID ${id} en los datos de la transacción.` }
            )
            .setFooter({ text: "Las donaciones van directo al Smart Contract" });

        await interaction.reply({ embeds: [embedDonar], ephemeral: false });
    }
});

client.login(process.env.DISCORD_TOKEN);