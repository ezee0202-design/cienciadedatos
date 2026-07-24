"use client"
import React, { useState, useEffect } from "react"
import { Slider } from "../../Componentes/Slider"
import "./filtro.css"

const CALIFICACIONES = [
  { label: "Sin calificación", value: "" },
  { label: "5 estrellas", value: "5" },
  { label: "4 estrellas", value: "4" },
  { label: "3 estrellas", value: "3" },
  { label: "2 estrellas", value: "2" },
  { label: "1 estrella", value: "1" },
]

type Opciones = {
  categorias: string[]
  zonas: string[]
  modalidades: string[]
  idiomas: string[]
  duracion: { min: number; max: number }
  precio: { min: number; max: number }
}

export default function Filtro({
  category,
  setCategory,
  price,
  setPrice,
  duration,
  setDuration,
  zone,
  setZone,
  modality,
  setModality,
  language,
  setLanguage,
  rating,
  setRating,
  onBuscar,
}: {
  category: string
  setCategory: (val: string) => void
  price: number
  setPrice: (val: number) => void
  duration: number
  setDuration: (val: number) => void
  zone: string
  setZone: (val: string) => void
  modality: string
  setModality: (val: string) => void
  language: string
  setLanguage: (val: string) => void
  rating: string
  setRating: (val: string) => void
  onBuscar: () => void
}) {
  const [opciones, setOpciones] = useState<Opciones | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOpciones() {
      try {
        const res = await fetch("http://localhost:5000/api/servicios/opciones")
        if (!res.ok) throw new Error("Error al cargar opciones")
        const data: Opciones = await res.json()
        setOpciones(data)

        // Inicializar selects con valor vacío (no filtrar)
        setCategory("")
        setZone("")
        setModality("")
        setLanguage("")
        setRating("")

        // Inicializar sliders en mínimos
        setPrice(data.precio.min)
        setDuration(data.duracion.min)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchOpciones()
  }, [setCategory, setZone, setModality, setLanguage, setPrice, setDuration])

  if (loading) return <p>Cargando filtros...</p>
  if (!opciones) return <p>Error al cargar filtros</p>

  return (
    <div className="search-containerFL">
      <h2 className="search-titleFL">Filtros de búsqueda</h2>

      <div className="form-groupFL">
        <label className="form-labelFL">Categoría</label>
        <select
          className="form-selectFL"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {opciones.categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="form-groupFL">
        <label className="form-labelFL">Precio (ARS)</label>
        <div className="slider-containerFL">
          <Slider
            max={opciones.precio.max}
            min={opciones.precio.min}
            step={1000}
            value={price}
            onChange={setPrice}
          />
        </div>
        <div className="slider-valuesFL">
          <span>${opciones.precio.min}</span>
          <span>${price}</span>
        </div>
      </div>

      <div className="form-groupFL">
        <label className="form-labelFL">Duración</label>
        <div className="slider-containerFL">
          <Slider
            max={opciones.duracion.max}
            min={opciones.duracion.min}
            step={30}
            value={duration}
            onChange={setDuration}
          />
        </div>
        <div className="slider-valuesFL">
          <span>{opciones.duracion.min} mins</span>
          <span>{duration} mins</span>
        </div>
      </div>

      <div className="form-groupFL">
        <label className="form-labelFL">Zona</label>
        <select
          className="form-selectFL"
          value={zone}
          onChange={(e) => setZone(e.target.value)}
        >
          <option value="">Seleccione una zona</option>
          {opciones.zonas.map((zona) => (
            <option key={zona} value={zona}>
              {zona}
            </option>
          ))}
        </select>
      </div>

      <div className="form-groupFL">
        <label className="form-labelFL">Modalidad</label>
        <select
          className="form-selectFL"
          value={modality}
          onChange={(e) => setModality(e.target.value)}
        >
          <option value="">Seleccione la modalidad</option>
          {opciones.modalidades.map((mod) => (
            <option key={mod} value={mod}>
              {mod}
            </option>
          ))}
        </select>
      </div>

      <div className="form-groupFL">
        <label className="form-labelFL">Idioma</label>
        <select
          className="form-selectFL"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="">Seleccione el idioma</option>
          {opciones.idiomas.map((idioma) => (
            <option key={idioma} value={idioma}>
              {idioma}
            </option>
          ))}
        </select>
      </div>

      <div className="form-groupFL">
        <label className="form-labelFL">Calificación</label>
        <select
          className="form-selectFL"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          {CALIFICACIONES.map(({ label, value }) => (
            <option key={label} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <button className="search-buttonFL" onClick={onBuscar}>
        Buscar
      </button>
    </div>
  )
}
