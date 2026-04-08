// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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

    event PerroRegistrado(uint id, string nombre, address padrino);
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

    function donar(uint perroId) public payable {
        require(perroId < contador, "Perro no existe");
        require(msg.value > 0, "Debe enviar dinero");

        perros[perroId].fondos += msg.value;

        emit Donacion(perroId, msg.value);
    }

    function registrarVerificacion(uint perroId) public {
        require(perroId < contador, "Perro no existe");

        perros[perroId].verificaciones++;

        emit Verificacion(perroId);
    }

    function retirarFondos(uint perroId) public {
        require(perroId < contador, "Perro no existe");

        Perro storage p = perros[perroId];

        require(msg.sender == p.padrino, "No eres el padrino");
        require(p.verificaciones >= 3, "No cumple verificaciones");
        require(p.fondos > 0, "No hay fondos");

        uint total = p.fondos;

        uint comision = (total * 5) / 100;
        uint pago = total - comision;

        p.fondos = 0;

        (bool successPago, ) = payable(p.padrino).call{value: pago}("");
        require(successPago, "Fallo transferencia al padrino");

        (bool successComision, ) = payable(owner).call{value: comision}("");
        require(successComision, "Fallo transferencia de comision");

        emit Retiro(perroId, total);
    }

    function verPerro(uint perroId) public view returns (Perro memory) {
        require(perroId < contador, "Perro no existe");
        return perros[perroId];
    }

    function totalPerros() public view returns (uint) {
        return contador;
    }
}