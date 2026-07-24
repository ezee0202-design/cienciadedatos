import React from "react";
import "./estadisticasEntrenador.css";
import { User, ArrowRight, Clock, Star } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactElement;
}

const StatCard = ({ title, value, subtitle, icon }: StatCardProps) => (
  <div className="stat-card">
    <div className="stat-header">
      <span className="stat-title">{title}</span>
      <span className="stat-icon">{icon}</span>
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-subtitle">{subtitle}</div>
  </div>
);

interface EstadisticasEntrenadorProps {
  visualizaciones: number;
  compras: number;
  tasaConversion: string;
  calificacionPromedio?: number;  // opcional
  cantidadResenas?: number;       // opcional
}

function EstadisticasEntrenador({
  visualizaciones,
  compras,
  tasaConversion,
  calificacionPromedio = 0,  // valor por defecto 0
  cantidadResenas = 0        // valor por defecto 0
}: EstadisticasEntrenadorProps) {
  return (
    <div className="stats-container">
      <div className="stats-grid">
        <StatCard
          title="Visualizaciones"
          value={visualizaciones.toString()}
          subtitle=""
          icon={<User size={24} />}
        />
        <StatCard
          title="Tasa de Conversión"
          value={`${tasaConversion}%`}
          subtitle=""
          icon={<ArrowRight size={24} />}
        />
        <StatCard
          title="Compras"
          value={compras.toString()}
          subtitle=""
          icon={<Clock size={24} />}
        />
        <StatCard
          title="Calificación Promedio"
          value={calificacionPromedio ? calificacionPromedio.toFixed(2) : "0.00"}
          subtitle={`${cantidadResenas} reseñas`}
          icon={<Star size={24} />}
        />
      </div>
    </div>
  );
}

export default EstadisticasEntrenador;
