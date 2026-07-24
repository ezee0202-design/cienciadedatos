"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"

import BarraEntrenadorVistaCliente from "../../../Componentes/BarraEntrenadorVistaCliente"
import CardPerfilEntrenador from "../cardPerfilEntrenador"
import Resena from "./reseñasConRespuesta"

/* ---------- tipos ---------- */
interface Entrenador {
  _id: string
  nombreCompleto: string
  email: string
  descripcion: string
  certificaciones: string[]
  fotoPerfilUrl: string
  FechaNacimiento: string
}

interface ReseñaBackend {
  _id: string;
  cliente: { nombreCompleto: string };
  servicio?: { _id: string; categoria: string }; // ← nuevo campo para el link
  calificacion: number;
  comentario?: string;
  respuesta?: string;
  fecha: string;
}


interface PromedioResponse {
  promedio: number
  cantidad: number
}

/* ---------- page ---------- */
export default function PerfilEntrenadorPage() {
  const { id } = useParams()
  const [entrenador, setEntrenador] = useState<Entrenador | null>(null)
  const [ratingPromedio, setRatingPromedio] = useState<PromedioResponse | null>(
    null
  )
  const [resenas, setResenas] = useState<ReseñaBackend[]>([])
  const [loadingEnt, setLoadingEnt] = useState(true)
  const [loadingRes, setLoadingRes] = useState(false)
  const [errorRes, setErrorRes] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    /* ---- ENTRENADOR + PROMEDIO ---- */
    const fetchEntrenador = async () => {
      try {
        const { data } = await axios.get<Entrenador>(
          `http://localhost:5000/api/usuarios/entrenadores/${id}`
        )
        setEntrenador(data)

        /* promedio/calificaciones */
        const { data: prom } = await axios.get<PromedioResponse>(
          `http://localhost:5000/api/resenas/promedio/${id}`
        )
        setRatingPromedio(prom)
      } catch (err) {
        console.error("Error al cargar el entrenador:", err)
      } finally {
        setLoadingEnt(false)
      }
    }

    /* ---- RESEÑAS ---- */
    const fetchResenas = async () => {
      setLoadingRes(true)
      try {
        const { data } = await axios.get<ReseñaBackend[]>(
          `http://localhost:5000/api/resenas/entrenador/${id}`
        )
        setResenas(data)
      } catch (err) {
        console.error("Error al cargar reseñas:", err)
        setErrorRes("No se pudieron cargar las reseñas.")
      } finally {
        setLoadingRes(false)
      }
    }

    fetchEntrenador()
    fetchResenas()
  }, [id])

  /* ---------- estados UI ---------- */
  if (loadingEnt)
    return <p style={{ textAlign: "center", marginTop: 50 }}>Cargando perfil…</p>

  if (!entrenador)
    return (
      <p style={{ textAlign: "center", marginTop: 50 }}>
        Entrenador no encontrado.
      </p>
    )

  /* calcular edad */
  const age = Math.floor(
    (Date.now() - new Date(entrenador.FechaNacimiento).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
  )

  const ratingValue = ratingPromedio?.promedio ?? 0

  /* ---------- render ---------- */
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
        {/* card izquierda */}
        <div style={{ width: 350, flexShrink: 0 }}>
          <CardPerfilEntrenador
            id={entrenador._id}
            name={entrenador.nombreCompleto}
            rating={ratingValue}
            age={age}
            photoUrl={entrenador.fotoPerfilUrl}
          />
        </div>

        {/* caja blanca derecha (reseñas) */}
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
            Reseñas de clientes
          </h2>

          {loadingRes && <p>Cargando reseñas…</p>}
          {errorRes && <p style={{ color: "red" }}>{errorRes}</p>}
          {!loadingRes && !errorRes && resenas.length === 0 && (
            <p>No hay reseñas disponibles.</p>
          )}

          {!loadingRes &&
            !errorRes &&
            resenas.map((r) => (
              <div key={r._id} style={{ marginBottom: 16 }}>
                <Resena
                  clienteNombre={r.cliente.nombreCompleto}
      calificacion={r.calificacion}
      comentario={r.comentario}
      respuesta={r.respuesta}
      fecha={r.fecha}
      servicio={r.servicio} // ← nuevo prop
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
