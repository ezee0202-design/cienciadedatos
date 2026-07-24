// ServicioCardCliente.tsx
'use client';

import React from 'react';
import { useNavigate } from 'react-router-dom';

const ActionButton: React.FC<{
  text: string;
  type?: 'primary' | 'secondary';
  onClick?: () => void;
  className?: string;
}> = ({ text, type = 'primary', onClick, className }) => (
  <button
    className={`action-btn ${type} ${className || ''}`}
    onClick={onClick}
    type="button"
  >
    {text}
  </button>
);

interface ServicioCardProps {
  reserva: any;
  onReprogramarClick: (reserva: any) => void;
  onEvaluarClick: (reserva: any) => void;
}

const ServicioCardCliente: React.FC<ServicioCardProps> = ({
  reserva,
  onReprogramarClick,
  onEvaluarClick,
}) => {
  const navigate = useNavigate();
  const servicio = reserva.servicioId ?? null;
  const { estado, tieneResena } = reserva;

  /* ---------- nav ---------- */
  const handleAgendarNueva = () => {
    if (servicio?._id) navigate(`/servicio/${servicio._id}`);
  };
  const handleContact = () => {
    if (servicio?.entrenador?._id) navigate(`/chat/${servicio.entrenador._id}`);
    else alert('No se pudo contactar al entrenador en este momento.');
  };
  const handleVerServicio = () => {
    if (servicio?._id) navigate(`/servicio/${servicio._id}`);
  };

  /* ---------- helpers ---------- */
  const formatFecha = (isoDate: string) => {
    const [y, m, d] = isoDate.slice(0, 10).split('-');
    return `${parseInt(d)}/${parseInt(m)}/${y}`;
  };

  const fecha   = formatFecha(reserva.fechaPreferida);
  const horaStr = reserva.horarioDeseado?.slice(0, 5) || ''; // HH:MM

  /* ---------- subcomponentes ---------- */
  const StatusDetails = () => {
    switch (estado) {
      case 'confirmada':
        return (
          <p className="status-info">
            Próxima sesión: {fecha} • {horaStr} hs
          </p>
        );
      case 'finalizada':
        return (
          <p className="status-info">
            Última sesión: {fecha} • {horaStr} hs
          </p>
        );
      case 'pendiente':
        return (
          <p className="status-info">
            Fecha seleccionada: {fecha} • {horaStr} hs
          </p>
        );
      case 'cancelada':
        return (
          <p className="status-info">
            Motivo: “El entrenador no tenía disponibilidad.”
          </p>
        );
      default:
        return null;
    }
  };

  const ActionButtons = () => {
    if (!servicio) return null;

    switch (estado) {
      case 'confirmada':
      case 'finalizada':
        return (
          <>
            <ActionButton
              text="Contactar entrenador"
              type="secondary"
              onClick={handleContact}
            />
            {!tieneResena && (
              <ActionButton
                text="Evaluar servicio"
                type="secondary"
                onClick={() => onEvaluarClick(reserva)}
              />
            )}
            <ActionButton
              text="Agendar nueva sesión"
              onClick={handleAgendarNueva}
            />
          </>
        );

      case 'pendiente':
        return (
          <ActionButton
            text="Reprogramar"
            onClick={() => onReprogramarClick(reserva)}
          />
        );

      case 'cancelada': {
        const fechaCancel = new Date(reserva.fechaPreferida)
          .toISOString()
          .slice(0, 10);
        const [y, m, d] = fechaCancel.split('-').map(Number);
        const [h, mm] = reserva.horarioDeseado.split(':').map(Number);
        const fechaHora = new Date(y, m - 1, d, h, mm, 0);
        const quedaMasDeUnDia =
          fechaHora.getTime() - Date.now() > 24 * 60 * 60 * 1000;

        return (
          <>
            {quedaMasDeUnDia && (
              <ActionButton
                text="Reprogramar"
                onClick={() => onReprogramarClick(reserva)}
              />
            )}
            <ActionButton
              text="Agendar nueva sesión"
              onClick={handleAgendarNueva}
            />
          </>
        );
      }

      default:
        return null;
    }
  };

  /* ---------- render ---------- */
  if (!servicio) {
    return (
      <div className={`service-card removed-service status-${estado}`}>
        <div className="card-main-info">
          <div className="card-header">
            <h2>Servicio eliminado</h2>
          </div>
          <div className="card-body">
            <p className="details-text">
              Este servicio ya no está disponible, pero mantenemos el registro
              de tu reserva para historial.
            </p>
          </div>
          <StatusDetails />
        </div>
      </div>
    );
  }

  return (
    <div className={`service-card status-${estado}`}>
      <div className="card-main-info">
        <div className="card-header">
          <ActionButton
            text="Ver servicio"
            className="solicitud-button view-button"
            onClick={handleVerServicio}
          />
        </div>

        <div className="card-body">
          <p className="status-text">
            {estado.charAt(0).toUpperCase() + estado.slice(1)}
          </p>
          <p className="details-text">
            ARS ${servicio.precio?.toLocaleString() ?? '-'} •{' '}
            {servicio.duracion ?? '-'} minutos
          </p>
          <StatusDetails />
        </div>
      </div>

      <div className="card-actions">
        <ActionButtons />
      </div>
    </div>
  );
};

export default ServicioCardCliente;
