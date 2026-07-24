// ReseñaCardCliente.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import './misReseñasCliente.css';

// Componente para mostrar las estrellas
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    return (
        <div className="star-display">
            {[...Array(5)].map((_, index) => (
                <span key={index} className={index < rating ? 'star-filled' : 'star-empty'}>
                    ★
                </span>
            ))}
        </div>
    );
};

interface ReseñaCardProps {
    reseña: any;
}

const ReseñaCardCliente: React.FC<ReseñaCardProps> = ({ reseña }) => {
    // Formato de la fecha
    const fechaFormateada = new Date(reseña.createdAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    return (
        <div className="reseña-card">
            <div className="reseña-header">
                <div className="reseña-header-info">
                    {reseña.servicio && reseña.servicio._id ? (
                        <Link to={`/servicio/${reseña.servicio._id}`} className="reseña-servicio-nombre">
                            {reseña.servicio.categoria}
                        </Link>
                    ) : (
                        <span className="reseña-servicio-nombre">{'Servicio no disponible'}</span>
                    )}
                    <span className="reseña-entrenador-nombre">Entrenador: {reseña.entrenador?.nombreCompleto || 'N/A'}</span>
                </div>
                <div className="reseña-header-fecha">
                    {fechaFormateada}
                </div>
            </div>
            
            <div className="reseña-body">
                <div className="reseña-calificacion">
                    <StarRating rating={reseña.calificacion} />
                </div>
                <p className="reseña-comentario">"{reseña.comentario}"</p>
            </div>
            
            {reseña.respuesta && (
                <div className="reseña-respuesta">
                    <strong>Respuesta del entrenador:</strong>
                    <p>"{reseña.respuesta}"</p>
                </div>
            )}
        </div>
    );
};

export default ReseñaCardCliente;