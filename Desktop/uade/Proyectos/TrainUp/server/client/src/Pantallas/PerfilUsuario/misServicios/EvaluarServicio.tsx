import React, { useState } from 'react';
import './evaluarServicio.css';

interface EvaluarServicioProps {
  booking: any;               // reserva completa
  onClose: () => void;
  onSuccess: () => void;
}

const EvaluarServicio: React.FC<EvaluarServicioProps> = ({
  booking,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      setError('Por favor, selecciona una calificación de 1 a 5 estrellas.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Sesión expirada. Inicia sesión de nuevo.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/api/resenas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reservaId: booking._id,      // 👈 solo la reserva
          calificacion: rating,
          comentario: comment,
        }),
      });

      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || 'No se pudo enviar la reseña.');
      }

      alert('¡Gracias por tu reseña!');
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Ocurrió un error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Evaluar Servicio</h2>
        <h3>{booking.servicioId.descripcion}</h3>
        <p>
          Duración: {booking.servicioId.duracion} min | Zona:{' '}
          {booking.servicioId.zona}
        </p>

        <div className="form-group">
          <label htmlFor="comentario">Comentario</label>
          <textarea
            id="comentario"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escribe tu comentario..."
          />
        </div>

        <div className="form-group">
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={star <= rating ? 'star filled' : 'star'}
                onClick={() => !isLoading && setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="modal-actions">
          <button
            onClick={handleSubmitReview}
            disabled={isLoading}
            className="button"
          >
            {isLoading ? 'Enviando...' : 'Confirmar'}
          </button>
          <button onClick={onClose} disabled={isLoading} className="button">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvaluarServicio;
