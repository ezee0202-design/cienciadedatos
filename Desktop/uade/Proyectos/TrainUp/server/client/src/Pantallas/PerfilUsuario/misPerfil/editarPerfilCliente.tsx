'use client';

import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import './infoPerfilCliente.css';

//límites
const MAX_NOMBRE = 40;          // máx. 60 caracteres
const CEL_DIGITOS = 8;          // número fijo de 8 dígitos
const ALTURA_MIN = 50;          // en cm
const ALTURA_MAX = 300;
const PESO_MIN = 20;            // en kg
const PESO_MAX = 400;
/* ──────────────────────────────────────────────────────────────────────── */

const EditarPerfilCliente: React.FC = () => {
  const { user }: { user: any } = useOutletContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombreCompleto: user.nombreCompleto || '',
    numeroCelular : user.numeroCelular  || '',
    alturaCm      : user.alturaCm       || '',
    pesoKg        : user.pesoKg         || '',
    fotoFile      : null as File | null,
    fotoPreview   : user.fotoPerfilUrl  || '',
  });

  /* ─── handlers de cambio ────────────────────────────────────────────── */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData(prev => ({
        ...prev,
        fotoFile: file,
        fotoPreview: URL.createObjectURL(file),
      }));
    }
  };

  /* ─── submit con validaciones extra ─────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    /* validaciones front */
    if (formData.nombreCompleto.length > MAX_NOMBRE) {
      return alert(`El nombre no puede superar ${MAX_NOMBRE} caracteres`);
    }
    if (!/^\d{8}$/.test(formData.numeroCelular)) {
      return alert('El número de celular debe tener exactamente 8 dígitos');
    }
    const altura = Number(formData.alturaCm);
    if (altura && (altura < ALTURA_MIN || altura > ALTURA_MAX)) {
      return alert(`La altura debe estar entre ${ALTURA_MIN} y ${ALTURA_MAX} cm`);
    }
    const peso = Number(formData.pesoKg);
    if (peso && (peso < PESO_MIN || peso > PESO_MAX)) {
      return alert(`El peso debe estar entre ${PESO_MIN} y ${PESO_MAX} kg`);
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('No estás autenticado. Redirigiendo al login.');
      return navigate('/loginSesion');
    }

    const form = new FormData();
    form.append('nombreCompleto', formData.nombreCompleto);
    form.append('numeroCelular', formData.numeroCelular);
    form.append('alturaCm', formData.alturaCm.toString());
    form.append('pesoKg', formData.pesoKg.toString());
    if (formData.fotoFile) form.append('foto', formData.fotoFile);

    try {
      const res = await fetch('http://localhost:5000/api/usuarios/me', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || `Error HTTP ${res.status}`);
      }
      alert('Perfil actualizado correctamente');
      navigate('/cliente/perfil');
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`);
    }
  };

  return (
    <form className="perfil-contenedor" onSubmit={handleSubmit}>
      <h2>Información de Perfil</h2>
      <p className="perfil-subtitulo">
        Administrá tu información personal a mostrar
      </p>

      {/* NOMBRE */}
      <div className="perfil-campo">
        <label>Nombre y Apellido</label>
        <input
          type="text"
          name="nombreCompleto"
          value={formData.nombreCompleto}
          onChange={handleChange}
          maxLength={MAX_NOMBRE}
          required
        />
        <small>{formData.nombreCompleto.length}/{MAX_NOMBRE}</small>
      </div>

      {/* CELULAR */}
      <div className="perfil-campo">
        <label>Número de Celular (8 dígitos)</label>
        <input
          type="text"
          name="numeroCelular"
          value={formData.numeroCelular}
          onChange={handleChange}
          inputMode="numeric"
          pattern="\d{8}"
          maxLength={CEL_DIGITOS}
          placeholder="Ej: 12345678"
          required
        />
      </div>

      {/* ALTURA */}
      <div className="perfil-campo">
        <label>Altura (cm)</label>
        <input
          type="number"
          name="alturaCm"
          value={formData.alturaCm}
          onChange={handleChange}
          min={ALTURA_MIN}
          max={ALTURA_MAX}
          step="1"
        />
      </div>

      {/* PESO */}
      <div className="perfil-campo">
        <label>Peso (kg)</label>
        <input
          type="number"
          name="pesoKg"
          value={formData.pesoKg}
          onChange={handleChange}
          min={PESO_MIN}
          max={PESO_MAX}
          step="1"
        />
      </div>

      {/* FOTO */}
      <div className="perfil-campo">
        <label>Foto de Perfil</label>
        <div className="upload-container">
          {formData.fotoPreview && (
            <img
              src={formData.fotoPreview}
              alt="Vista previa"
              className="perfil-foto-perfil"
            />
          )}
          <div className="upload-controls-right">
            <label htmlFor="file-upload" className="custom-file-button">
              Seleccionar archivo
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <span className="file-name-display">
              {formData.fotoFile
                ? formData.fotoFile.name
                : 'Ningún archivo seleccionado'}
            </span>
          </div>
        </div>
      </div>

      {/* BOTÓN SUBMIT */}
      <div className="perfil-submit-container">
        <button type="submit" className="perfil-editar-btn">
          Guardar Datos
        </button>
      </div>
    </form>
  );
};

export default EditarPerfilCliente;
