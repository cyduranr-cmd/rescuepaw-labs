# Master Protocol: Supervisión del Contrato ⚖️

**Gobernanza del Contrato `RescuePaw.sol`:**
El Agente supervisa que la lógica de retiro se cumpla estrictamente bajo los siguientes parámetros:

1. **Distribución de Fondos (Regla 95/5):**
    - El **95%** de cada retiro se transfiere automáticamente a la wallet del `padrino`.
    - El **5%** se retiene como comisión de mantenimiento para la cuenta `owner` (Tesorería del Agente).
    
2. **Protocolo de Verificación:**
    - Ningún fondo puede ser retirado si el perro no cuenta con al menos **3 verificaciones** de la comunidad. Esto previene retiros de registros falsos que hayan logrado pasar el primer filtro.

3. **Inmutabilidad:**
    - Una vez que el Agente firma la aprobación de un registro, los datos son definitivos. El Agente no tiene poder para modificar registros existentes, solo para validar nuevos ingresos.