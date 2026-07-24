"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"

import BarraEntrenadorVistaCliente from "../../../Componentes/BarraEntrenadorVistaCliente"
import CardPerfilEntrenador from "../cardPerfilEntrenador"
import ServiceCard from "../serviciosDisponibles/serviciosDisponibleEntrenador"

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

interface Servicio {
  _id: string
  categoria: string
  duracion: number
  zona: string
  descripcion: string
  precio: number
  modalidad: string
}

interface PromedioResponse {
  promedio: number
  cantidad: number
}

/* ---------- page ---------- */
export default function ServiciosEntrenadorPage() {
  const { id } = useParams()
  const [entrenador, setEntrenador] = useState<Entrenador | null>(null)
  const [ratingPromedio, setRatingPromedio] = useState<PromedioResponse | null>(
    null
  )
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loadingEnt, setLoadingEnt] = useState(true)
  const [loadingServ, setLoadingServ] = useState(false)
  const [errorEnt, setErrorEnt] = useState<string | null>(null)
  const [errorServ, setErrorServ] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    /* ---- ENTRENADOR + PROMEDIO ---- */
    const fetchEntrenador = async () => {
      try {
        const { data } = await axios.get<Entrenador>(
          `http://localhost:5000/api/usuarios/entrenadores/${id}`
        )
        setEntrenador(data)

        const { data: prom } = await axios.get<PromedioResponse>(
          `http://localhost:5000/api/resenas/promedio/${id}`
        )
        setRatingPromedio(prom)
      } catch (err) {
        console.error("Error al cargar el entrenador:", err)
        setErrorEnt("No se pudo cargar el perfil del entrenador.")
      } finally {
        setLoadingEnt(false)
      }
    }

    /* ---- SERVICIOS ---- */
    const fetchServicios = async () => {
      setLoadingServ(true)
      setErrorServ(null)
      try {
        const { data } = await axios.get<Servicio[]>(
          `http://localhost:5000/api/servicios/entrenador/${id}`
        )
        setServicios(data)
      } catch (err) {
        console.error("Error al cargar servicios:", err)
        setErrorServ("No se pudieron cargar los servicios.")
      } finally {
        setLoadingServ(false)
      }
    }

    fetchEntrenador()
    fetchServicios()
  }, [id])

  if (loadingEnt)
    return <p style={{ textAlign: "center", marginTop: 50 }}>Cargando perfil…</p>

  if (errorEnt)
    return (
      <p style={{ textAlign: "center", marginTop: 50, color: "red" }}>
        {errorEnt}
      </p>
    )

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

        {/* servicios derecha */}
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
          <h2
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 16,
            }}
          >
            Servicios disponibles
          </h2>

          {loadingServ && <p>Cargando servicios…</p>}
          {errorServ && <p style={{ color: "red" }}>{errorServ}</p>}

          {!loadingServ && !errorServ && servicios.length === 0 && (
            <p>No hay servicios disponibles.</p>
          )}

          {!loadingServ && !errorServ && servicios.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                alignItems: "center",
              }}
            >
              {servicios.map((s) => (
                <ServiceCard
                  key={s._id}
                  id={s._id}
                  title={s.categoria}
                  tag={s.modalidad}
                  duration={`${s.duracion} minutos`}
                  location={s.zona}
                  price={`$${s.precio.toLocaleString()}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
