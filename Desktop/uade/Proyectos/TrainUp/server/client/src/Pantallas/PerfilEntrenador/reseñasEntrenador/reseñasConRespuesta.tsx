import React from 'react';
import './reseñasConRespuesta.css';
import { Link } from 'react-router-dom';

interface ResenaProps {
  clienteNombre: string;
  calificacion: number;
  comentario?: string;
  respuesta?: string;
  fecha: string | Date;
  servicio?: {
    _id: string;
    categoria: string;
  };
}

const Resena: React.FC<ResenaProps> = ({
  clienteNombre,
  calificacion,
  comentario,
  respuesta,
  fecha,
  servicio,
}) => {
  const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const estrellas = Array.from({ length: 5 }, (_, i) =>
    i < calificacion ? '★' : '☆'
  ).join('');

  return (
    <div className="resena">

      {/* LINK AL SERVICIO: arriba a la izquierda */}
      {servicio && servicio._id ? (
        <Link to={`/servicio/${servicio._id}`} className="resena-servicio-link">
          {servicio.categoria}
        </Link>
      ) : (
        <span className="resena-servicio-no-disponible">Servicio no disponible</span>
      )}

      {/* HEADER: cliente + estrellas */}
      <div className="resena-header">
        <span className="resena-cliente">{clienteNombre}</span>
        <span className="resena-calificacion">{estrellas}</span>
      </div>

      {/* Fecha debajo del header */}
      <div className="resena-fecha">{fechaFormateada}</div>

      {comentario && <p className="resena-comentario">"{comentario}"</p>}

      {respuesta && (
        <div className="resena-respuesta">
          <strong>Respuesta del entrenador:</strong>
          <p>"{respuesta}"</p>
        </div>
      )}
    </div>
  );
};

export default Resena;
