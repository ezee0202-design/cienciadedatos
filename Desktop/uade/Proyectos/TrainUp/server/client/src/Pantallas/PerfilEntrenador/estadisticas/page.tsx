// EstadisticasEntrenadorPage.tsx
import React, { useEffect, useState } from "react";
import EstadisticasEntrenador from "./estadisticasEntrenador";

const EstadisticasEntrenadorPage = () => {
  const [visualizaciones, setVisualizaciones] = useState(0);
  const [compras, setCompras] = useState(0);
  const [tasaConversion, setTasaConversion] = useState("0");

  // NUEVOS estados para calificación promedio y cantidad
  const [calificacionPromedio, setCalificacionPromedio] = useState(0);
  const [cantidadResenas, setCantidadResenas] = useState(0);

  const storedUser = localStorage.getItem("usuario");
  const entrenadorId = storedUser ? JSON.parse(storedUser).id : null;

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/interacciones/estadisticas/${entrenadorId}`);
        const data = await res.json();
        setVisualizaciones(data.visualizaciones);
        setCompras(data.compras);
        setTasaConversion(data.tasaConversion);
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
      }
    };

    if (entrenadorId) fetchEstadisticas();
  }, [entrenadorId]);

  // NUEVO useEffect para traer la calificación promedio y cantidad de reseñas
  useEffect(() => {
    const fetchCalificacionPromedio = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/resenas/promedio/${entrenadorId}`);
        const data = await res.json();
        setCalificacionPromedio(data.promedio);
        setCantidadResenas(data.cantidad);
      } catch (error) {
        console.error("Error al obtener calificación promedio:", error);
      }
    };

    if (entrenadorId) fetchCalificacionPromedio();
  }, [entrenadorId]);

  return (
    <div className="estadisticas-container">
      <h2>Mis Estadísticas</h2>
      <EstadisticasEntrenador
        visualizaciones={visualizaciones}
        compras={compras}
        tasaConversion={tasaConversion}
        calificacionPromedio={calificacionPromedio}
        cantidadResenas={cantidadResenas}
      />
    </div>
  );
};

export default EstadisticasEntrenadorPage;
