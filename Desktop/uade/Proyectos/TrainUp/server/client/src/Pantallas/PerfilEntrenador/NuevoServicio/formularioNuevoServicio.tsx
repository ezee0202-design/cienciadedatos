"use client";
import React, { useEffect, useState } from "react";
import "./formularioNuevoServicio.css";
import axios from "axios";

type Opciones = {
  categorias: string[];
  zonas: string[];
  modalidades: string[];
  idiomas: string[];
  duracion: { min: number; max: number };
  precio: { min: number; max: number };
};

export default function FormularioNuevoServicio() {
  const [opciones, setOpciones] = useState<Opciones | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------- traer listas ---------- */
  useEffect(() => {
    async function fetchOpciones() {
      try {
        const res = await fetch("/api/servicios/opciones");
        if (!res.ok) throw new Error("No se pudieron cargar las opciones");
        const data: Opciones = await res.json();
        setOpciones(data);
      } catch (err) {
        console.error(err);
        alert("Error cargando las listas de opciones");
      } finally {
        setLoading(false);
      }
    }
    fetchOpciones();
  }, []);

  /* ---------- submit ---------- */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    /* --- Validar descripción (20-2000) --- */
    const descripcion = (data.get("descripcion") as string).trim();
    if (descripcion.length < 20 || descripcion.length > 2000) {
      alert("La descripción debe tener entre 20 y 2000 caracteres.");
      return;
    }

    /* --- Validar y normalizar rango horario --- */
    const rangoOriginal = data.get("rangoHorario") as string;
    const match = rangoOriginal.match(
      /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/
    );
    if (!match) {
      alert("Formato de rango horario inválido. Usa HH:MM - HH:MM");
      return;
    }
    const [, h1, m1, h2, m2] = match.map(Number) as unknown as number[];
    if (
      h1 > 23 || h2 > 23 || m1 > 59 || m2 > 59 ||
      h1 < 0  || h2 < 0  || m1 < 0 || m2 < 0
    ) {
      alert("Hora inválida. Verifica horas (0-23) y minutos (0-59).");
      return;
    }
    const horaInicio = `${String(h1).padStart(2, "0")}:${String(m1).padStart(2, "0")}`;
    const horaFin    = `${String(h2).padStart(2, "0")}:${String(m2).padStart(2, "0")}`;
    data.set("rangoHorario", `${horaInicio} - ${horaFin}`);

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/servicios", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Servicio creado exitosamente");
      form.reset();
    } catch (error: any) {
      console.error(
        "Error al crear el servicio:",
        JSON.stringify(error.response?.data, null, 2) || error.message
      );

      const detalles = error.response?.data?.detalles;
      if (detalles?.length) {
        alert("Errores:\n" + detalles.join("\n"));
      } else {
        alert(
          `Ocurrió un error: ${error.response?.data?.error || error.message}`
        );
      }
    }
  };

  if (loading)             return <p>Cargando formulario...</p>;
  if (!opciones)           return <p>Error al cargar opciones.</p>;

  /* ---------- UI ---------- */
  return (
    <div className="form-container">
      <h2>Crear un nuevo servicio</h2>

      <form onSubmit={handleSubmit} className="form-servicio">
        <div className="input-grid">
          <select name="categoria" required className="input-nuevo-servicio">
            <option value="">Seleccione categoría</option>
            {opciones.categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            name="duracion"
            type="number"
            placeholder="Duración (minutos)"
            required
            min={opciones.duracion.min}
            max={opciones.duracion.max}
            className="input-nuevo-servicio"
          />

          <input
            name="diasDisponibles"
            type="text"
            placeholder="Días disponibles"
            required
            className="input-nuevo-servicio"
          />

          <input
            name="rangoHorario"
            type="text"
            placeholder="Rango horario (HH:MM - HH:MM)"
            required
            className="input-nuevo-servicio"
          />

          <select name="idioma" required className="input-nuevo-servicio">
            <option value="">Seleccione idioma</option>
            {opciones.idiomas.map((idi) => (
              <option key={idi} value={idi}>
                {idi}
              </option>
            ))}
          </select>

          <select name="zona" required className="input-nuevo-servicio">
            <option value="">Seleccione zona</option>
            {opciones.zonas.map((zona) => (
              <option key={zona} value={zona}>
                {zona}
              </option>
            ))}
          </select>

          <select name="modalidad" required className="input-nuevo-servicio">
            <option value="">Seleccione modalidad</option>
            {opciones.modalidades.map((mod) => (
              <option key={mod} value={mod}>
                {mod}
              </option>
            ))}
          </select>

          <input
            name="precio"
            type="number"
            placeholder="Precio del servicio"
            required
            min={opciones.precio.min}
            max={opciones.precio.max}
            className="input-nuevo-servicio"
          />
        </div>

        <textarea
          name="descripcion"
          placeholder="Descripción del servicio"
          rows={3}
          required
          className="input-nuevo-servicio"
        ></textarea>

        <label className="file-upload">
          📎 Subir imagen del servicio
          <input name="imagen" type="file" accept="image/*" hidden />
        </label>

        <button type="submit" className="btn-nuevo-servicio">
          Agregar servicio
        </button>
      </form>
    </div>
  );
}
