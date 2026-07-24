import React, { useEffect, useState } from "react";
import ReviewResponseCard from "./receñasRecibidasEntrenador"; // ajustá ruta si cambia

interface Resena {
  id: string;
  date: string;
  userName: string;
  rating: number;
  commentText: string;
  respuesta?: string;
  servicioId: string; // puede ser "inexistente"
  servicioCategoria: string;
}

const ResenasEntrenadorPage: React.FC = () => {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [entrenadorId, setEntrenadorId] = useState<string | null>(null);

  /* Obtener perfil del entrenador */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/usuarios/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error("Error al obtener perfil");
        const data = await res.json();
        setEntrenadorId(data._id);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  /* Obtener reseñas del entrenador */
  useEffect(() => {
    if (!entrenadorId) return;
    (async () => {
      try {
        const res = await fetch(`/api/resenas/entrenador/${entrenadorId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error("Error al cargar reseñas");

        const data = await res.json();

        const arr: Resena[] = data.map((r: any) => ({
          id: r._id,
          date: new Date(r.fecha).toLocaleDateString(),
          userName: r.cliente?.nombreCompleto || "Usuario",
          rating: r.calificacion,
          commentText: r.comentario,
          respuesta: r.respuesta,
          // si el populate viene en r.servicio._id, o solo id, o null:
          servicioId: r.servicio?._id || r.servicio || "inexistente",
          servicioCategoria: r.servicio?.categoria || "Servicio no disponible", 
        }));

        setResenas(arr);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [entrenadorId]);

  /* Enviar respuesta */
  const handleSubmitResponse = async (id: string, respuesta: string) => {
    try {
      const res = await fetch(`/api/resenas/${id}/responder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ respuesta }),
      });
      if (!res.ok) throw new Error("Error al enviar respuesta");

      setResenas(prev =>
        prev.map(r => (r.id === id ? { ...r, respuesta } : r))
      );
    } catch (err) {
      console.error(err);
      alert("No se pudo enviar la respuesta. Intenta nuevamente.");
    }
  };

  return (
    <div>
      <h2>
        Comentarios Recibidos
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 30,
          gap: 20,
          maxWidth: 650,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {resenas.length === 0 && <p>No hay reseñas recibidas.</p>}

        {resenas.map(r => (
          <ReviewResponseCard
            key={r.id}
            id={r.id}
            date={r.date}
            userName={r.userName}
            rating={r.rating}
            commentText={r.commentText}
            respuesta={r.respuesta}
            servicioId={r.servicioId}
            servicioCategoria={r.servicioCategoria}
            onSubmitResponse={handleSubmitResponse}
          />
        ))}
      </div>
    </div>
  );
};

export default ResenasEntrenadorPage;
