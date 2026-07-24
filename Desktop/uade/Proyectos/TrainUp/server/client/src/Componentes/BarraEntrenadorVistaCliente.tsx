import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const secciones = ['Acerca de', 'Servicios', 'Reseñas'];

interface BarraEntrenadorVistaClienteProps {
  onSeleccionar?: (seccion: string) => void;
}

const BarraEntrenadorVistaCliente: React.FC<BarraEntrenadorVistaClienteProps> = ({ onSeleccionar }) => {
  const [seleccionado, setSeleccionado] = useState('Acerca de');
  const [entrenadorId, setEntrenadorId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Actualizamos el entrenadorId cada vez que cambia la ruta o localStorage (por si se actualiza)
  useEffect(() => {
    const id = localStorage.getItem('entrenadorIdVistaCliente');
    setEntrenadorId(id);
  }, [location.pathname]);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('AcercaDe')) {
      setSeleccionado('Acerca de');
    } else if (path.includes('ServiciosDisponiblesEntrenador')) {
      setSeleccionado('Servicios');
    } else if (path.includes('ResenasConRespuesta')) {
      setSeleccionado('Reseñas');
    }
  }, [location.pathname]);

  const handleClick = (seccion: string) => {
    setSeleccionado(seccion);
    if (onSeleccionar) onSeleccionar(seccion);

    switch (seccion) {
      case 'Acerca de':
        if (entrenadorId) navigate(`/AcercaDe/${entrenadorId}`);
        break;
      case 'Servicios':
        if (entrenadorId) navigate(`/ServiciosDisponiblesEntrenador/${entrenadorId}`);
        break;
      case 'Reseñas':
        if (entrenadorId) navigate(`/ResenasConRespuesta/${entrenadorId}`);
        break;
      default:
        break;
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    backgroundColor: '#e0e0e0',
    borderRadius: '25px',
    overflow: 'hidden',
    width: '100%',
    height: '40px',
    maxWidth: '500px',
    position: 'relative',
  };

  const buttonStyle: React.CSSProperties = {
    flex: 1,
    border: 'none',
    background: 'transparent',
    color: '#777',
    fontWeight: 500,
    cursor: 'pointer',
    zIndex: 2,
    transition: 'color 0.3s ease',
  };

  const indicadorStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: `${100 / secciones.length}%`,
    backgroundColor: '#5caeff',
    borderRadius: '25px',
    transition: 'left 0.3s ease',
    zIndex: 1,
    left: `${secciones.indexOf(seleccionado) * (100 / secciones.length)}%`,
  };

  const getBotonEstilo = (seccion: string): React.CSSProperties => ({
    ...buttonStyle,
    color: seleccionado === seccion ? 'white' : '#777',
    fontWeight: seleccionado === seccion ? 'bold' : 500,
  });

  return (
    <div style={containerStyle}>
      <div style={indicadorStyle} />
      {secciones.map((seccion) => (
        <button
          key={seccion}
          style={getBotonEstilo(seccion)}
          onClick={() => handleClick(seccion)}
        >
          {seccion}
        </button>
      ))}
    </div>
  );
};

export default BarraEntrenadorVistaCliente;
