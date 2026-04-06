// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

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
        uint verificaciones;
        uint fondos;
        uint nivelConfianza;
    }

    mapping(uint => Perro) public perros;
    uint public contador;

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    event PerroRegistrado(uint id, string nombre);
    event Donacion(uint perroId, uint monto);
    event Verificacion(uint perroId);
    event Retiro(uint perroId, uint monto);

    function registrarPerro(
        string memory nombre,
        string memory raza,
        string memory color,
        string memory tamano,
        string memory distrito,
        string memory zonaReferencia,
        string memory imageHash,
        uint nivelConfianza
    ) public {

        perros[contador] = Perro(
            nombre,
            raza,
            color,
            tamano,
            distrito,
            zonaReferencia,
            imageHash,
            msg.sender,
            0,
            0,
            nivelConfianza
        );

        emit PerroRegistrado(contador, nombre);

        contador++;
    }

    function donar(uint perroId) public payable {
        require(msg.value > 0, "Debe enviar dinero");

        perros[perroId].fondos += msg.value;

        emit Donacion(perroId, msg.value);
    }

    function registrarVerificacion(uint perroId) public {
        perros[perroId].verificaciones++;

        emit Verificacion(perroId);
    }

    function retirarFondos(uint perroId) public {

        Perro storage p = perros[perroId];

        require(p.padrino == msg.sender, "No eres el padrino");
        require(p.verificaciones >= 3, "No cumple verificaciones");
        require(p.fondos > 0, "No hay fondos");

        uint total = p.fondos;

        uint comision = total * 5 / 100;
        uint pago = total - comision;

        p.fondos = 0;

        payable(p.padrino).transfer(pago);
        payable(owner).transfer(comision);

        emit Retiro(perroId, total);
    }

    function verPerro(uint perroId) public view returns (Perro memory) {
        return perros[perroId];
    }
}