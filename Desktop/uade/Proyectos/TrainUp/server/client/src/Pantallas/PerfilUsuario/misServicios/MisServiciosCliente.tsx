// MisServiciosCliente.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ServicioCardCliente from './ServicioCardCliente';
import ReprogramarSesion from './reprogramarSesion';
import EvaluarServicio from './EvaluarServicio';
import './misServiciosCliente.css';

const MisServiciosCliente: React.FC = () => {
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isReprogramarModalOpen, setIsReprogramarModalOpen] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<any | null>(null);

  const [isEvaluarModalOpen, setIsEvaluarModalOpen] = useState(false);
  const [selectedReservaParaEvaluar, setSelectedReservaParaEvaluar] =
    useState<any | null>(null);

  const navigate = useNavigate();

  /* ---------- traer reservas ---------- */
  const fetchReservas = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/reservas/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al obtener las reservas.');
      setReservas(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  /* ---------- reprogramar ---------- */
  const openReprogramar = (reserva: any) => {
    setSelectedReserva(reserva);
    setIsReprogramarModalOpen(true);
  };
  const closeReprogramar = () => {
    setSelectedReserva(null);
    setIsReprogramarModalOpen(false);
  };
  const handleReprogramSuccess = () => {
    closeReprogramar();
    fetchReservas();
  };

  /* ---------- evaluar ---------- */
  const openEvaluar = (reserva: any) => {
    setSelectedReservaParaEvaluar(reserva);
    setIsEvaluarModalOpen(true);
  };
  const closeEvaluar = () => {
    setSelectedReservaParaEvaluar(null);
    setIsEvaluarModalOpen(false);
  };

  // callback después de guardar reseña ➜ actualiza state para ocultar botón
  const handleEvaluarSuccess = (idReserva: string) => {
    setReservas(prev =>
      prev.map(r =>
        r._id === idReserva ? { ...r, tieneResena: true } : r
      )
    );
    closeEvaluar();
  };

  /* ---------- UI ---------- */
  if (loading && reservas.length === 0) {
    return (
      <div className="loading-container">
        Cargando historial de servicios...
      </div>
    );
  }

  return (
    <>
      <div className="mis-servicios-container">
        <h2>Historial de servicios</h2>

        {reservas.length > 0 ? (
          reservas.map(reserva => (
            <ServicioCardCliente
              key={reserva._id}
              reserva={reserva}
              onReprogramarClick={openReprogramar}
              onEvaluarClick={openEvaluar}
            />
          ))
        ) : (
          <p>Aún no has contratado ningún servicio.</p>
        )}
      </div>

      {/* ---------- modal reprogramar ---------- */}
      {isReprogramarModalOpen && selectedReserva && (
        <ReprogramarSesion
          booking={selectedReserva}
          onClose={closeReprogramar}
          onSuccess={handleReprogramSuccess}
        />
      )}

      {/* ---------- modal evaluar ---------- */}
      {isEvaluarModalOpen && selectedReservaParaEvaluar && (
        <EvaluarServicio
          booking={selectedReservaParaEvaluar}
          onClose={closeEvaluar}
          onSuccess={() => handleEvaluarSuccess(selectedReservaParaEvaluar._id)}
        />
      )}
    </>
  );
};

export default MisServiciosCliente;
