/* PerfilEntrenadorPage.tsx */
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import BarraEntrenadorVistaCliente from "../../../Componentes/BarraEntrenadorVistaCliente";
import CardPerfilEntrenador from "../cardPerfilEntrenador";

interface Entrenador {
  _id: string;
  nombreCompleto: string;
  email: string;
  descripcion: string;
  certificaciones: string[];
  fotoPerfilUrl: string;
  FechaNacimiento: string; // ISO
}

export default function PerfilEntrenadorPage() {
  const { id } = useParams();
  const [entrenador, setEntrenador] = useState<Entrenador | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [{ data: user }, { data: resena }] = await Promise.all([
          axios.get<Entrenador>(
            `http://localhost:5000/api/usuarios/entrenadores/${id}`
          ),
          axios.get<{ promedio: number }>(
            `http://localhost:5000/api/resenas/promedio/${id}`
          ),
        ]);

        setEntrenador(user);
        setRating(resena.promedio || 0);
      } catch (err) {
        console.error("Error al cargar entrenador:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: 50 }}>Cargando perfil…</p>
    );
  if (!entrenador)
    return (
      <p style={{ textAlign: "center", marginTop: 50 }}>
        Entrenador no encontrado.
      </p>
    );

  /* calcular edad */
  const age = Math.floor(
    (Date.now() - new Date(entrenador.FechaNacimiento).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
  );

  return (
    <div>
      {/* barra */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}>
        <BarraEntrenadorVistaCliente />
      </div>

      {/* contenido */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 40,
          gap: 40,
          padding: "0 20px",
        }}
      >
        {/* card */}
        <div style={{ width: 350, flexShrink: 0 }}>
          <CardPerfilEntrenador
            id={entrenador._id}
            name={entrenador.nombreCompleto}
            rating={rating}
            age={age}
            photoUrl={entrenador.fotoPerfilUrl}
          />
        </div>

        {/* datos mínimos */}
        <div
          style={{
            maxWidth: 700,
            backgroundColor: "white",
            padding: 24,
            borderRadius: 12,
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            flexGrow: 1,
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
            Información del entrenador
          </h2>

          <p>
            <strong>Descripción:</strong>{" "}
            {entrenador.descripcion || "—"}
          </p>

          <p>
            <strong>Email:</strong> {entrenador.email}
          </p>

          <p>
            <strong>Certificaciones:</strong>
          </p>
          <ul style={{ paddingLeft: 20 }}>
            {entrenador.certificaciones?.length ? (
              entrenador.certificaciones.map((c, i) => <li key={i}>{c}</li>)
            ) : (
              <li>No hay certificaciones registradas</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
