import React from "react";
import { Link } from "react-router-dom";
import "./infoPerfilCliente.css";

interface InfoPerfilClienteProps {
  nombreApellido: string;
  correoElectronico: string;
  fechaNacimiento: string;
  numeroCelular: string;
  alturaCm: number;
  pesoKg: number;
  fotoPerfilUrl: string;
}

const InfoPerfilCliente: React.FC<InfoPerfilClienteProps> = ({
  nombreApellido,
  correoElectronico,
  fechaNacimiento,
  numeroCelular,
  alturaCm,
  pesoKg,
  fotoPerfilUrl,
}) => {
  return (
    <div className="perfil-contenedor">
      <h2>Información de Perfil</h2>
      <p className="perfil-subtitulo">
        Administrá tu información personal a mostrar
      </p>

      {/* Botón justo debajo del subtítulo */}
      <div className="perfil-submit-container top">
        <Link to="/cliente/editar-perfil" className="perfil-editar-btn">
          Editar Perfil
        </Link>
      </div>

      <div className="perfil-campo">
        <label>Nombre y Apellido</label>
        <input type="text" value={nombreApellido} readOnly />
      </div>

      <div className="perfil-campo">
        <label>Correo Electrónico</label>
        <input type="text" value={correoElectronico} readOnly />
      </div>

      <div className="perfil-campo">
        <label>Fecha de Nacimiento</label>
        <input type="text" value={fechaNacimiento} readOnly />
      </div>

      <div className="perfil-campo">
        <label>Número de Celular</label>
        <input type="text" value={numeroCelular} readOnly />
      </div>

      <div className="perfil-campo">
        <label>Altura (cm)</label>
        <input type="text" value={alturaCm} readOnly />
      </div>

      <div className="perfil-campo">
        <label>Peso (kg)</label>
        <input type="text" value={pesoKg} readOnly />
      </div>

      <div className="perfil-campo">
        <label>Foto de Perfil</label>
        <img
          src={fotoPerfilUrl}
          alt="Foto de perfil"
          className="perfil-foto-perfil"
        />
      </div>
    </div>
  );
};

export default InfoPerfilCliente;
