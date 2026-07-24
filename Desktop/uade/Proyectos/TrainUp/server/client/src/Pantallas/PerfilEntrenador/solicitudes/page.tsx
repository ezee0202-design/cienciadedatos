import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SolicitudEntrenador from "./solicitudEntrenador";

interface Solicitud {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  durationMinutes: number;
  userName: string;
  status: "Pendiente" | "Aceptado" | "Rechazado" | "Finalizado";
}

const SolicitudesEntrenadorPage: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const navigate = useNavigate();

  /*carga inicial*/
  useEffect(() => {
    (async () => {
      const usuarioString = localStorage.getItem("usuario");
      if (!usuarioString) return;

      const { id: entrenadorId } = JSON.parse(usuarioString) ?? {};
      if (!entrenadorId) return;

      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/reservas/entrenador/${entrenadorId}`
        );

        const solicitudesFormateadas = data.map((s: any) => ({
          id: s.id,
          serviceId: s.serviceId,
          serviceName: s.serviceName,
          date: new Date(s.date).toISOString().split("T")[0], // YYYY-MM-DD
          time: s.time,
          durationMinutes: s.durationMinutes,
          userName: s.userName,
          status: s.status,
        }));
console.log("Solicitudes formateadas:", solicitudesFormateadas);
        setSolicitudes(solicitudesFormateadas);
      } catch (err) {
        console.error("Error al obtener solicitudes:", err);
      }
    })();
  }, []);

  /*  handlers */
  const handleAccept = async (id: string) => {
    try {
      await axios.patch(`http://localhost:5000/api/reservas/${id}`, {
        estado: "confirmada",
      });
      setSolicitudes((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: "Aceptado" } : s
        )
      );
      alert("Solicitud aceptada");
    } catch (err) {
      console.error("Error al aceptar:", err);
      alert("Hubo un error al aceptar la solicitud.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axios.patch(`http://localhost:5000/api/reservas/${id}`, {
        estado: "cancelada",
      });
      setSolicitudes((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: "Rechazado" } : s
        )
      );
      alert("Solicitud rechazada");
    } catch (err) {
      console.error("Error al rechazar:", err);
      alert("Hubo un error al rechazar la solicitud.");
    }
  };

  /* render*/
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 30,
          gap: 20,
          paddingBottom: 50,
        }}
      >
        {solicitudes.length === 0 && <p>No hay solicitudes.</p>}

        {solicitudes.map(
          ({
            id,
            serviceId,
            serviceName,
            date,
            time,
            durationMinutes,
            userName,
            status,
          }) => (
            <SolicitudEntrenador
              key={id}
              serviceId={serviceId}
              serviceName={serviceName}
              date={date}
              time={time}
              durationMinutes={durationMinutes}
              userName={userName}
              status={status}
              onAccept={status === "Pendiente" ? () => handleAccept(id) : undefined}
              onReject={status === "Pendiente" ? () => handleReject(id) : undefined}
            />
          )
        )}
      </div>
    </div>
  );
};

export default SolicitudesEntrenadorPage;
