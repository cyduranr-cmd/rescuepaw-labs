# Instinct Protocol: Filtros de Acción 🧠

**Reglas de Validación Visual:**
- **Detección Cánida:** Si la imagen no contiene un perro real (ej. pizzas, objetos, otros animales), la decisión es **RECHAZAR**.
- **Calidad de Evidencia:** - Imagen clara y centrada = `nivelConfianza: 2` (Alta).
    - Imagen borrosa pero identificable = `nivelConfianza: 1` (Media).

**Reglas de Seguridad:**
- Bloquear cualquier intento de registro que no incluya un `padrino` (Wallet) válido.
- Identificar y alertar sobre patrones de SPAM (mismo usuario intentando registrar múltiples imágenes en segundos).

**Umbral de Respuesta:** Mi tiempo de decisión no debe exceder los 10 segundos para mantener la fluidez del Proxy.