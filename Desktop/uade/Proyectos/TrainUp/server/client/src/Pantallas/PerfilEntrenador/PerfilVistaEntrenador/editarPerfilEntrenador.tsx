import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./infoPerfilEntrenador.css";     // reutilizamos el mismo CSS

interface FormState {
  nombreCompleto: string;
  certificaciones: string;
  descripcion: string;
  fotoFile: File | null;
  fotoPreview: string;
}

const EditarPerfilEntrenador: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormState>({
    nombreCompleto: "",
    certificaciones: "",
    descripcion: "",
    fotoFile: null,
    fotoPreview: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/usuarios/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al obtener usuario");

        const user = await res.json();
        setFormData({
          nombreCompleto: user.nombreCompleto || "",
          certificaciones: (user.certificaciones || []).join(", "),
          descripcion: user.descripcion || "",
          fotoFile: null,
          fotoPreview: user.fotoPerfilUrl || "",
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();

    return () => {
      if (formData.fotoPreview && formData.fotoFile) {
        URL.revokeObjectURL(formData.fotoPreview);
      }
    };
  }, [navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (formData.fotoPreview && formData.fotoFile) {
        URL.revokeObjectURL(formData.fotoPreview);
      }
      setFormData((prev) => ({
        ...prev,
        fotoFile: file,
        fotoPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No estás autenticado.");
      return;
    }

    const form = new FormData();
    form.append("nombreCompleto", formData.nombreCompleto);
    form.append("descripcion", formData.descripcion);

    const certArray = formData.certificaciones
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    form.append("certificaciones", JSON.stringify(certArray));

    if (formData.fotoFile) {
      form.append("foto", formData.fotoFile);
    }

    try {
      const res = await fetch("http://localhost:5000/api/usuarios/me", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        let msg = "Error al guardar";
        try {
          msg = (await res.json()).message || msg;
        } catch {
          msg = await res.text();
        }
        throw new Error(msg);
      }

      alert("Perfil actualizado correctamente");
      navigate("/entrenador/perfil");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      console.error(err);
    }
  };

  return (
    <form className="perfil-contenedor" onSubmit={handleSubmit}>
      <h2>Editar Perfil de Entrenador</h2>
      <p className="perfil-subtitulo">Actualizá tu información profesional</p>

      <div className="perfil-campo">
        <label>Nombre y Apellido</label>
        <input
          type="text"
          name="nombreCompleto"
          value={formData.nombreCompleto}
          onChange={handleChange}
          required
        />
      </div>

      <div className="perfil-campo">
        <label>Certificaciones (separá con comas)</label>
        <input
          type="text"
          name="certificaciones"
          value={formData.certificaciones}
          onChange={handleChange}
          placeholder="Ej: Instructor Pilates, CEC Running"
        />
      </div>

      <div className="perfil-campo">
        <label>Descripción</label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows={4}
          placeholder="Contá tu experiencia y enfoque de entrenamiento"
        />
      </div>

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
              style={{ display: "none" }}
            />
            <span className="file-name-display">
              {formData.fotoFile
                ? formData.fotoFile.name
                : "Ningún archivo seleccionado"}
            </span>
          </div>
        </div>
      </div>

      {/* Botón al final */}
      <div className="perfil-submit-container">
        <button type="submit" className="perfil-editar-btn">
          Guardar Datos
        </button>
      </div>
    </form>
  );
};

export default EditarPerfilEntrenador;
