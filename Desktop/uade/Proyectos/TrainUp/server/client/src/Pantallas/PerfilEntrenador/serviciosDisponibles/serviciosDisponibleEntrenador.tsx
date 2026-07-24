import React from "react";
import { useNavigate } from "react-router-dom";
import './serviciosDisponibleEntrenador.css';

interface ServiceCardProps {
  id: string;
  title: string;
  tag: string;
  duration: string;
  location: string;
  price: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  title,
  tag,
  duration,
  location,
  price,
}) => {
  const navigate = useNavigate();

  const handleContratar = () => {
    navigate(`/servicio/${id}`);
  };

  return (
    <div className="service-cardSD">
      <div className="headerSD">
        <h3 className="titleSD">{title}</h3>
        <span className="priceSD">ARS {price}</span>
      </div>

      <div className="tag-containerSD">
        <span className="tagSD">{tag}</span>
      </div>

      <div className="detailsSD">
        <span>
          Duración: {duration} | Zona: {location}
        </span>
      </div>

      <button className="contract-buttonSD" onClick={handleContratar}>
        Ver más
      </button>
    </div>
  );
};

export default ServiceCard;
