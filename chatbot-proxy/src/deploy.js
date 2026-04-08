const { deployCommands } = require("./src/commands");

console.log("🚀 Iniciando el registro de comandos en Discord...");

deployCommands()
    .then(() => {
        console.log("✅ ¡Comandos registrados con éxito!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Error al registrar comandos:", error);
        process.exit(1);
    });