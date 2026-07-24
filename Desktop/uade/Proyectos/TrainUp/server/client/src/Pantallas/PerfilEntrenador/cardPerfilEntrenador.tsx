/* cardPerfilEntrenador.tsx */
"use client";
import { useNavigate } from "react-router-dom";
import "./cardPerfilEntrenador.css";
import defaultAvatar from "../../assets/default-avatar.png";

type CardProps = {
  id: string;          // para navegar al chat
  name: string;
  rating: number;      // promedio (0‑5)
  age: number;         // años de edad
  photoUrl: string;
};

export default function CardPerfilEntrenador({
  id,
  name,
  rating,
  age,
  photoUrl,
}: CardProps) {
  const navigate = useNavigate();

  return (
    <div className="profile-card">
      <div className="photo-container">
        <img
          src={photoUrl || defaultAvatar}
          alt={name}
          className="profile-photo"
          onError={(e) => (e.currentTarget.src = defaultAvatar)}
        />
      </div>

      <div className="info-container">
        <h2 className="name">{name}</h2>

        <p className="rating-row">
          <span className="star">⭐</span>{" "}
          {rating > 0 ? rating.toFixed(1) : "Sin calificar"}
        </p>

        <p className="age-row">Edad: {age} años</p>

        <button
          className="contact-button"
          onClick={() => navigate(`/chat/${id}`)}
        >
          Contactar
        </button>
      </div>
    </div>
  );
}
