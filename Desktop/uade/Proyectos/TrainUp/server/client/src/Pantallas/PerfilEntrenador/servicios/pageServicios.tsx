"use client";
import React, { useEffect, useState } from "react";
import MisServiciosCard from "./misServiciosEntrenador";
import DeleteServiceModal from "../../../Componentes/AvisoEliminar";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MisServicios: React.FC = () => {
  const [servicios, setServicios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [servicioAEliminar, setServicioAEliminar] = useState<string | null>(null);
  const navigate = useNavigate();

  /* ---------- traer servicios ---------- */
  const fetchServicios = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/servicios/mios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServicios(data);
    } catch (error) {
      console.error("Error al obtener los servicios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  /* ---------- handlers variados ---------- */
  const handleEditar      = (id: string) => navigate(`/editar-servicio/${id}`);
  const handleNuevo       = () => navigate("/FormularioNuevoServicio");
  const handleAsistencia  = (id: string) => navigate(`/AsistenciaSesionesEntrenador/${id}`);
  const handleEliminar    = (id: string) => { setServicioAEliminar(id); setModalVisible(true); };

  const handlePublicar = async (id: string, nuevoEstado: boolean) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/servicios/${id}/publicar`,
        { publicado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setServicios(prev =>
        prev.map(s => (s._id === id ? { ...s, publicado: nuevoEstado } : s))
      );
    } catch (error) {
      console.error("Error al actualizar estado de publicación:", error);
    }
  };

  /* ---------- eliminar servicio ---------- */
  const confirmarEliminacion = async () => {
    if (!servicioAEliminar) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/servicios/${servicioAEliminar}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // quita de la lista local
      setServicios(prev => prev.filter(s => s._id !== servicioAEliminar));
      alert("Servicio eliminado correctamente.");
    } catch (error: any) {
      if (error.response?.status === 400) {
        alert(error.response.data.message || "No se puede eliminar el servicio.");
      } else {
        alert("Error al eliminar el servicio. Intenta nuevamente.");
        console.error("Error al eliminar el servicio:", error);
      }
    } finally {
      // siempre cerrar modal y limpiar estado
      setModalVisible(false);
      setServicioAEliminar(null);
    }
  };

  /* ---------- render ---------- */
  return (
    <div style={styles.content}>
      <h2 style={styles.titulo}>Mis Servicios</h2>

      {loading ? (
        <p>Cargando servicios...</p>
      ) : servicios.length === 0 ? (
        <p>No tenés servicios cargados aún.</p>
      ) : (
        servicios.map(servicio => (
          <MisServiciosCard
            key={servicio._id}
            tag={servicio.categoria}
            price={servicio.precio}
            duration={`${servicio.duracion} min`}
            isPublished={servicio.publicado}
            onEdit={() => handleEditar(servicio._id)}
            onAssistance={() => handleAsistencia(servicio._id)}
            onDelete={() => handleEliminar(servicio._id)}
            onTogglePublish={nuevo => handlePublicar(servicio._id, nuevo)}
            onView={() => navigate(`/servicio/${servicio._id}`)}
          />
        ))
      )}

      <DeleteServiceModal
        isOpen={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setServicioAEliminar(null);
        }}
        onConfirmDelete={confirmarEliminacion}
      />
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  content: { padding: "0px 40px" },
  titulo : { fontSize: "24px", fontWeight: "bold", marginBottom: "20px" },
};

export default MisServicios;
