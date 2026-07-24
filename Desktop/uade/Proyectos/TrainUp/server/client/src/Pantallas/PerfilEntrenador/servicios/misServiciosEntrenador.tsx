import React from "react";
import "./misServiciosEntrenador.css";

interface MisServiciosEntrenadorProps {
  key: string;
  tag: string;
  price: number;
  duration: string;
  isPublished: boolean;
  onEdit: () => void;
  onAssistance: () => void;
  onDelete: () => void;
  onTogglePublish: (isPublished: boolean) => void;
  onView: () => void;
}

const MisServiciosEntrenador: React.FC<MisServiciosEntrenadorProps> = ({
  key,
  tag,
  price,
  duration,
  isPublished,
  onEdit,
  onAssistance,
  onDelete,
  onTogglePublish,
  onView,
}) => {
  return (
    <div className="management-card">
      <div className="info-section">
        <div className="info-section-top">
          <div className="title-tag-row">
            <h2 className="service-name">{tag}</h2> 
          </div>
          <p className="service-details">
            ARS ${price.toLocaleString()} &bull; {duration}
          </p>
        </div>

        <div className="info-section-bottom">
          <button className="action-button view-details" onClick={onView}>
            Ver servicio
          </button>
        </div>
      </div>

      <div className="actions-section">
        <div className="publish-container">
          <label className="switch">
            <input
              type="checkbox"
              id={`publish-${key}`}
              checked={isPublished}
              onChange={() => onTogglePublish(!isPublished)}
            />
            <span className="slider round"></span>
          </label>
          <label htmlFor={`publish-${key}`} className="publish-text">
            Publicado
          </label>
        </div>
        
        <div className="action-button-group">
          <button className="action-button secondary" onClick={onEdit}>
            Editar
          </button>
          <button className="action-button secondary" onClick={onAssistance}>
            Asistencia
          </button>
          <button className="action-button delete" onClick={onDelete}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MisServiciosEntrenador;