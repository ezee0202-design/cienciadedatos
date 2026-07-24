import React from "react";
import "./cardFiltros.css";

type RunningClassCardProps = {
  logo: string;
  titulo: string;
  tags: string[];          // ← zona, modalidad, idioma
  descripcion: string;
  entrenador: string;
  precio: number;
  duracion: string;

  rating: number;          // promedio (0‑5)
  reviewsCount: number;    // nº de reseñas
  onClick: () => void;
};

/* Estrellitas */
const Stars: React.FC<{ value: number }> = ({ value }) => (
  <span className="stars">
    {Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < Math.round(value) ? "star filled" : "star"}>
        ★
      </span>
    ))}
  </span>
);

const RunningClassCard: React.FC<RunningClassCardProps> = ({
  logo,
  titulo,
  tags,
  descripcion,
  entrenador,
  precio,
  duracion,
  rating,
  reviewsCount,
  onClick,
}) => (
  <div className="card">
    <div className="card-content">
      {/* Logo */}
      <div className="logo-container">
        <img src={logo} alt={titulo} className="logo" />
      </div>

      {/* Título */}
      <h3 className="title">{titulo}</h3>

      {/* Tags azulados */}
      <div className="tag-container">
        {tags.map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>

      {/* Descripción */}
      <p className="description">{descripcion}</p>

      {/* Rating */}
      <div className="rating-block">
        <Stars value={rating} />
        <span className="rating-number">
          {rating.toFixed(1)} ({reviewsCount})
        </span>
      </div>

      {/* Solo el nombre del entrenador (ya no zona / modalidad / idioma) */}
      <div className="trainer-info">
        <p className="trainer-name">Entrenador: {entrenador}</p>
      </div>

      {/* Precio */}
      <p className="price">
        ARS ${precio.toLocaleString()} / {duracion}
      </p>

      {/* Botón */}
      <button className="button" onClick={onClick}>
        Ver más
      </button>
    </div>
  </div>
);

export default RunningClassCard;
