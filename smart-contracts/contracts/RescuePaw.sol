// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RescuePaw
 * @dev Contrato para la gestión de rescates animales con validación por Agente Autónomo.
 */
contract RescuePaw {

    struct Perro {
        string nombre;
        string raza;
        string color;
        string tamano;
        string distrito;
        string zonaReferencia;
        string imageHash;
        address padrino;
        uint verificaciones; // Contador de pruebas de alimentación/vida
        uint fondos;        // Balance acumulado de donaciones
        uint nivelConfianza; // Calificación otorgada por la IA del Agente
    }

    mapping(uint => Perro) public perros;
    uint public contador;
    address public owner;

    // --- EVENTOS ---
    event PerroRegistrado(uint id, string nombre, address padrino);
    event Donacion(uint perroId, uint monto);
    event Verificacion(uint perroId);
    event Retiro(uint perroId, uint monto);

    /**
     * @dev Define que solo el Agente Autónomo (dueño del contrato) puede ejecutar la función.
     */
    modifier soloAgente() {
        require(msg.sender == owner, "Solo el Agente (Owner) puede validar");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Registra un nuevo perro en la blockchain.
     */
    function registrarPerro(
        string memory nombre,
        string memory raza,
        string memory color,
        string memory tamano,
        string memory distrito,
        string memory zonaReferencia,
        string memory imageHash,
        uint nivelConfianza,
        address padrino
    ) public {
        require(padrino != address(0), "Wallet invalida");

        perros[contador] = Perro(
            nombre,
            raza,
            color,
            tamano,
            distrito,
            zonaReferencia,
            imageHash,
            padrino,
            0,
            0,
            nivelConfianza
        );

        emit PerroRegistrado(contador, nombre, padrino);
        contador++;
    }

    /**
     * @dev Permite a los usuarios donar TSYS a un perro específico.
     */
    function donar(uint perroId) public payable {
        require(perroId < contador, "Perro no existe");
        require(msg.value > 0, "Debe enviar dinero");

        perros[perroId].fondos += msg.value;

        emit Donacion(perroId, msg.value);
    }

    /**
     * @dev Incrementa el contador de verificaciones. 
     * Solo puede ser llamado por el Agente tras validar una foto de alimentación.
     */
    function registrarVerificacion(uint perroId) public soloAgente {
        require(perroId < contador, "Perro no existe");

        perros[perroId].verificaciones++;

        emit Verificacion(perroId);
    }

    /**
     * @dev Permite al padrino retirar los fondos si cumple con 3 verificaciones.
     * Aplica la política 95% para el padrino y 5% para mantenimiento de la IA.
     */
    function retirarFondos(uint perroId) public {
        require(perroId < contador, "Perro no existe");

        Perro storage p = perros[perroId];

        require(msg.sender == p.padrino, "No eres el padrino");
        require(p.verificaciones >= 3, "No cumple con las 3 verificaciones minimas");
        require(p.fondos > 0, "No hay fondos acumulados");

        uint total = p.fondos;
        
        // Lógica de comisión 95/5
        uint comision = (total * 5) / 100;
        uint pagoAlPadrino = total - comision;

        // Reset de fondos antes de la transferencia para evitar ataques de reentrada
        p.fondos = 0;

        // Transferencia al Padrino (95%)
        (bool successPago, ) = payable(p.padrino).call{value: pagoAlPadrino}("");
        require(successPago, "Fallo transferencia al padrino");

        // Transferencia de comisión al Agente/Owner (5%)
        (bool successComision, ) = payable(owner).call{value: comision}("");
        require(successComision, "Fallo transferencia de comision");

        emit Retiro(perroId, total);
    }

    // --- FUNCIONES DE CONSULTA ---

    function verPerro(uint perroId) public view returns (Perro memory) {
        require(perroId < contador, "Perro no existe");
        return perros[perroId];
    }

    function totalPerros() public view returns (uint) {
        return contador;
    }
}