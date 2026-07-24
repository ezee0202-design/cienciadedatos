"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../NuevoServicio/formularioNuevoServicio.css";
import { useNavigate, useParams } from "react-router-dom";

type Opciones = {
  categorias : string[];
  zonas      : string[];
  modalidades: string[];
  idiomas    : string[];
  duracion   : { min: number; max: number };
  precio     : { min: number; max: number };
};

export default function FormularioEditarServicio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [opciones, setOpciones] = useState<Opciones | null>(null);
  const [formData, setFormData] = useState({
    categoria      : "",
    duracion       : "",
    diasDisponibles: "",
    rangoHorario   : "",
    idioma         : "",
    zona           : "",
    modalidad      : "",
    precio         : "",
    descripcion    : "",
  });
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------- cargar opciones + servicio ---------- */
  useEffect(() => {
    const fetchTodo = async () => {
      try {
        const optRes = await fetch("/api/servicios/opciones");
        if (!optRes.ok) throw new Error("No se pudieron cargar las opciones");
        setOpciones(await optRes.json());

        const token = localStorage.getItem("token");
        const { data: s } = await axios.get(
          `http://localhost:5000/api/servicios/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setFormData({
          categoria      : s.categoria ?? "",
          duracion       : s.duracion?.toString() ?? "",
          diasDisponibles: s.diasDisponibles ?? "",
          rangoHorario   : s.rangoHorario ?? "",
          idioma         : s.idioma ?? "",
          zona           : s.zona ?? "",
          modalidad      : s.modalidad ?? "",
          precio         : s.precio?.toString() ?? "",
          descripcion    : s.descripcion ?? "",
        });
      } catch (err) {
        console.error(err);
        alert("Error al cargar datos u opciones.");
        navigate("/entrenador/servicios");
      } finally {
        setLoading(false);
      }
    };
    fetchTodo();
  }, [id, navigate]);

  /* ---------- handlers ---------- */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setImagenFile(e.target.files[0]);
  };

  /* ---------- submit ---------- */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    /* validación descripción 20-2000 */
    const desc = formData.descripcion.trim();
    if (desc.length < 20 || desc.length > 2000) {
      alert("La descripción debe tener entre 20 y 2000 caracteres.");
      return;
    }

    /* validar y normalizar rango horario */
    const m = formData.rangoHorario.match(
      /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/
    );
    if (!m) {
      alert("Formato de rango horario inválido. Usa HH:MM - HH:MM");
      return;
    }
    const [, h1, mi1, h2, mi2] = m.map(Number) as unknown as number[];
    if (
      h1 > 23 || h2 > 23 || mi1 > 59 || mi2 > 59 ||
      h1 < 0  || h2 < 0  || mi1 < 0 || mi2 < 0
    ) {
      alert("Hora inválida. Verifica horas (0-23) y minutos (0-59).");
      return;
    }
    const horaInicio = `${String(h1).padStart(2, "0")}:${String(mi1).padStart(2, "0")}`;
    const horaFin    = `${String(h2).padStart(2, "0")}:${String(mi2).padStart(2, "0")}`;

    try {
      const token = localStorage.getItem("token");
      const updateData = new FormData();

      Object.entries({
        ...formData,
        rangoHorario: `${horaInicio} - ${horaFin}`,
      }).forEach(([k, v]) => updateData.append(k, v));

      if (imagenFile) updateData.append("imagen", imagenFile);

      await axios.patch(
        `http://localhost:5000/api/servicios/${id}`,
        updateData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Servicio actualizado exitosamente");
      navigate("/entrenador/servicios");
    } catch (error: any) {
      const res = error.response;
      if (res?.status === 400) {
        const det = res.data?.detalles;
        if (det?.length) alert("Errores:\n" + det.join("\n"));
        else alert(res.data.message || "Este servicio no puede editarse porque tiene reservas confirmadas.");
      } else if (res?.status === 403) {
        alert("No estás autorizado para editar este servicio.");
      } else {
        alert("Error inesperado al actualizar el servicio.");
      }
      console.error(error);
    }
  };

  if (loading)   return <p>Cargando...</p>;
  if (!opciones) return <p>Error al cargar opciones.</p>;

  /* ---------- UI ---------- */
  return (
    <div className="form-container">
      <h2>Editar servicio</h2>

      <form onSubmit={handleSubmit} className="form-servicio">
        <div className="input-grid">
          <select name="categoria" required value={formData.categoria} onChange={handleChange} className="input-nuevo-servicio">
            <option value="">Seleccione categoría</option>
            {opciones.categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <input name="duracion" type="number" required
            min={opciones.duracion.min} max={opciones.duracion.max}
            placeholder="Duración (min)"
            value={formData.duracion} onChange={handleChange}
            className="input-nuevo-servicio" />

          <input name="diasDisponibles" type="text" required
            placeholder="Días disponibles"
            value={formData.diasDisponibles} onChange={handleChange}
            className="input-nuevo-servicio" />

          <input name="rangoHorario" type="text" required
            placeholder="Rango horario (HH:MM - HH:MM)"
            value={formData.rangoHorario} onChange={handleChange}
            className="input-nuevo-servicio" />

          <select name="idioma" required value={formData.idioma} onChange={handleChange} className="input-nuevo-servicio">
            <option value="">Seleccione idioma</option>
            {opciones.idiomas.map(i => <option key={i} value={i}>{i}</option>)}
          </select>

          <select name="zona" required value={formData.zona} onChange={handleChange} className="input-nuevo-servicio">
            <option value="">Seleccione zona</option>
            {opciones.zonas.map(z => <option key={z} value={z}>{z}</option>)}
          </select>

          <select name="modalidad" required value={formData.modalidad} onChange={handleChange} className="input-nuevo-servicio">
            <option value="">Seleccione modalidad</option>
            {opciones.modalidades.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <input name="precio" type="number" required
            min={opciones.precio.min} max={opciones.precio.max}
            placeholder="Precio"
            value={formData.precio} onChange={handleChange}
            className="input-nuevo-servicio" />
        </div>

        <textarea name="descripcion" rows={3} required
          placeholder="Descripción del servicio"
          value={formData.descripcion} onChange={handleChange}
          className="input-nuevo-servicio" />

        <label className="file-upload">
          📎 Subir nueva imagen
          <input type="file" accept="image/*" hidden onChange={handleFileChange} />
        </label>

        <button type="submit" className="btn-nuevo-servicio">
          Actualizar servicio
        </button>
      </form>
    </div>
  );
}
