import React, { useEffect, useState } from "react";
import "./cardInfoServicio.css";
import { useParams, useNavigate } from "react-router-dom";

type Servicio = {
  _id: string;
  imagenServicio: string;
  categoria: string;
  precio: number;
  modalidad: string;
  zona: string;
  descripcion: string;
  idioma: string;
  duracion: number;
  diasDisponibles: string;
  rangoHorario: string;
  entrenador: { nombreCompleto: string };
};

type ServicioConRating = Servicio & {
  promedio: number;
  cantidad: number;
};

const fetchPromedioServicio = async (servicioId: string) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/resenas/promedio-servicio/${servicioId}`
    );
    if (!res.ok) throw new Error("Error al obtener promedio");
    return await res.json();
  } catch (error) {
    console.error("Error en fetchPromedioServicio:", error);
    return { promedio: 0, cantidad: 0 };
  }
};

const CardInfoServicio: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [servicio, setServicio] = useState<ServicioConRating | null>(null);
  const [loading, setLoading] = useState(true);
  const usuarioRaw = localStorage.getItem("usuario");
const rol = usuarioRaw ? JSON.parse(usuarioRaw).role : null;

  useEffect(() => {
    const fetchServicio = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/servicios/${id}`);
        if (!res.ok) throw new Error("No se pudo obtener el servicio");
        const data: Servicio = await res.json();

        const { promedio, cantidad } = await fetchPromedioServicio(data._id);
        setServicio({ ...data, promedio, cantidad });

        // Registrar visualización SOLO si NO soy entrenador
        if (rol !== "entrenador") {
          await fetch("http://localhost:5000/api/interacciones", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              servicioId: data._id,
              tipo: "visualizacion",
            }),
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchServicio();
  }, [id, rol]);

  /*handler de compra */
  const handleContratar = () => {
    if (rol === "entrenador") {
      alert("Los entrenadores no pueden contratar servicios.");
      return;
    }
    navigate("/FinalizarCompra/" + id, { state: { servicio } });
  };

  if (loading) return <p>Cargando servicio...</p>;
  if (!servicio) return <p>No se encontró el servicio.</p>;

console.log("ROL DETECTADO ⇒", rol);
console.log(localStorage.getItem("user"));
console.log(localStorage.getItem("role"));

  return (
    <div className="card-servicioINFSR">
      <div className="card-headerINFSR">
        <img
          src={servicio.imagenServicio ?? "/icons/default.svg"}
          alt="Imagen del servicio"
          className="card-logoINFSR"
        />
      </div>

      <div className="card-bodyINFSR">
        <div className="card-title-sectionINFSR">
          <h3 className="card-titleINFSR">{servicio.categoria}</h3>
          <span className="card-priceINFSR">
            ARS ${servicio.precio.toLocaleString()}
          </span>
        </div>

        <div className="card-tagsINFSR">
          {[servicio.modalidad, servicio.zona].map((tag, i) => (
            <span key={i} className="tagINFSR">
              {tag}
            </span>
          ))}
        </div>

        <p className="card-textINFSR">
          <strong>Entrenador:</strong>{" "}
          {servicio.entrenador?.nombreCompleto || "Entrenador"}
        </p>

        <p className="card-textINFSR">
          <strong>Duración:</strong> {servicio.duracion} min |{" "}
          <strong>Zona:</strong> {servicio.zona}
        </p>

        <p className="card-textINFSR">
          <strong>Disponibilidad:</strong> {servicio.diasDisponibles} |{" "}
          {servicio.rangoHorario}
        </p>

        <p className="card-textINFSR">{servicio.descripcion}</p>

        <p className="card-textINFSR">
          <strong>Idioma:</strong> {servicio.idioma}
        </p>

        <p className="card-textINFSR">
          <strong>Modalidad:</strong> {servicio.modalidad}
        </p>

        <p className="card-textINFSR" style={{ marginTop: 10 }}>
          <strong>Calificación promedio:</strong>{" "}
          {servicio.promedio.toFixed(1)} ⭐ (
          {servicio.cantidad}{" "}
          {servicio.cantidad === 1 ? "calificación" : "calificaciones"})
        </p>
      </div>

      <div className="card-footerINFSR">
        <button
          className="card-buttonINFSR"
          onClick={handleContratar}
          disabled={rol === "entrenador"}
          style={{ opacity: rol === "entrenador" ? 0.6 : 1 }}
        >
          Contratar servicio
        </button>
      </div>
    </div>
  );
};

export default CardInfoServicio;
