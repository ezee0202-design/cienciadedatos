import React from "react";
import { useNavigate } from "react-router-dom";
import "./solicitudEntrenador.css";

interface SolicitudEntrenadorProps {
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  durationMinutes: number;
  userName: string;
  status: "Pendiente" | "Aceptado" | "Rechazado" | "Finalizado";
  onAccept?: () => void;
  onReject?: () => void;
}

function SolicitudEntrenador({
  serviceId,
  serviceName,
  date,
  time,
  durationMinutes,
  userName,
  status,
  onAccept,
  onReject,
}: SolicitudEntrenadorProps) {
  const navigate = useNavigate();

  return (
    <div className="solicitud-card-container">
      <h2 className="solicitud-service-name">{serviceName}</h2>

      <div className="solicitud-details-row">
        <div className="solicitud-datetime-info">
          <span className="solicitud-icon">📅</span>
          <span className="solicitud-detail-text">{date}</span>
          <span className="solicitud-icon ml-5">⏰</span>
          <span className="solicitud-detail-text">
            {time} ({durationMinutes} min)
          </span>
        </div>
        <span className={`solicitud-status-badge ${status.toLowerCase()}`}>
          {status}
        </span>
      </div>

      <div className="solicitud-user-row">
        <span className="solicitud-icon">👤</span>
        <span className="solicitud-detail-text">{userName}</span>
      </div>

      {/* Acciones */}
      <div className="solicitud-actions">
        <div className="left-actions">
          <button
            className="solicitud-button view-button"
            onClick={() => navigate(`/servicio/${serviceId}`)}
          >
            Ver servicio
          </button>
        </div>

        <div className="right-actions">
          {status === "Pendiente" && (
            <>
              {onAccept && (
                <button
                  className="solicitud-button accept-button"
                  onClick={onAccept}
                >
                  Aceptar
                </button>
              )}
              {onReject && (
                <button
                  className="solicitud-button reject-button"
                  onClick={onReject}
                >
                  Rechazar
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SolicitudEntrenador;
