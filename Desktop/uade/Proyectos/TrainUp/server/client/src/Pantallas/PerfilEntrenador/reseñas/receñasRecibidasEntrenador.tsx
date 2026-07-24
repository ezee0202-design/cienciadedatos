import React, { useState } from "react";
import { Link } from "react-router-dom"; // Importar Link
import "./receñasRecibidasEntrenador.css"; // Usaremos un CSS unificado

interface ReviewResponseCardProps {
  id: string;
  date: string;
  userName: string;
  rating: number;
  commentText: string;
  respuesta?: string;
  servicioId: string;
  servicioCategoria: string; // Prop añadida
  onSubmitResponse: (id: string, respuesta: string) => void;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="star-display">
        {[...Array(5)].map((_, index) => (
            <span key={index} className={index < rating ? 'star-filled' : 'star-empty'}>★</span>
        ))}
    </div>
);

const ReviewResponseCard: React.FC<ReviewResponseCardProps> = ({
  id,
  date,
  userName,
  rating,
  commentText,
  respuesta,
  servicioId,
  servicioCategoria,
  onSubmitResponse,
}) => {
  const [isResponding, setIsResponding] = useState(false);
  const [draft, setDraft] = useState("");

  const handleSend = () => {
    if (draft.trim()) onSubmitResponse(id, draft.trim());
    setDraft("");
    setIsResponding(false);
  };

  return (
    // Usamos las mismas clases que en la tarjeta del cliente
    <div className="review-card-container">
      <div className="reseña-header">
        <div className="reseña-header-info">
          {servicioId !== 'inexistente' ? (
            <Link to={`/servicio/${servicioId}`} className="reseña-servicio-nombre">
              {servicioCategoria}
            </Link>
          ) : (
            <span className="reseña-servicio-nombre">{servicioCategoria}</span>
          )}
          <span className="reseña-entrenador-nombre">De: {userName}</span>
        </div>
        <div className="reseña-header-fecha">{date}</div>
      </div>

      <div className="reseña-body">
        <div className="reseña-calificacion">
          <StarRating rating={rating} />
        </div>
        <p className="reseña-comentario">"{commentText}"</p>
      </div>

      {/* Lógica para mostrar la respuesta o el formulario para responder */}
      {respuesta && (
        <div className="reseña-respuesta">
          <strong>Tu respuesta:</strong>
          <p>"{respuesta}"</p>
        </div>
      )}

      {!respuesta && !isResponding && (
        <button className="respond-button" onClick={() => setIsResponding(true)}>
          Responder
        </button>
      )}

      {!respuesta && isResponding && (
        <div className="response-form">
          <textarea
            className="response-textarea"
            placeholder="Escribe tu respuesta..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="response-actions">
            <button className="save-button" onClick={handleSend}>Enviar</button>
            <button className="cancel-button" onClick={() => setIsResponding(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewResponseCard;