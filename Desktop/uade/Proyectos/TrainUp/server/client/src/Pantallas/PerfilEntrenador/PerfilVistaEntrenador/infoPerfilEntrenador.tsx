import React from "react";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../../../assets/foto-perfil-default.png";
import "./infoPerfilEntrenador.css";

type Props = {
  nombre: string;
  fechaNacimiento: string;
  certificaciones: string[];
  descripcion: string;
  fotoPerfilUrl: string;
};

const InfoPerfilEntrenador: React.FC<Props> = ({
  nombre,
  fechaNacimiento,
  certificaciones,
  descripcion,
  fotoPerfilUrl,
}) => {
  const navigate = useNavigate();

  const handleEditar = () => {
    navigate("/entrenador/editar-perfil");
  };

  return (
    <div className="perfil-contenedor">
      <h2>Información de Perfil</h2>
      <p className="perfil-subtitulo">
        Administrá tu información personal a mostrar
      </p>

      {/* Botón justo debajo del subtítulo */}
      <div className="perfil-submit-container top">
        <button className="perfil-editar-btn" onClick={handleEditar}>
          Editar Perfil
        </button>
      </div>

      <div className="perfil-campo">
        <label>Nombre y Apellido</label>
        <input type="text" value={nombre} readOnly />
      </div>

      <div className="perfil-campo">
        <label>Fecha de nacimiento</label>
        <input type="text" value={fechaNacimiento} readOnly />
      </div>

      <div className="perfil-campo">
        <label>Formación y Certificaciones</label>
        {certificaciones.length > 0 ? (
          certificaciones.map((cert, idx) => (
            <input key={idx} type="text" value={cert} readOnly />
          ))
        ) : (
          <p>No hay certificaciones cargadas</p>
        )}
      </div>

      <div className="perfil-campo">
        <label>Descripción</label>
        <textarea value={descripcion} readOnly />
      </div>

      <div className="perfil-campo">
        <label>Foto de Perfil</label>
        <img
          src={fotoPerfilUrl || defaultAvatar}
          alt="Foto de perfil"
          className="perfil-foto-perfil"
        />
      </div>
    </div>
  );
};

export default InfoPerfilEntrenador;
