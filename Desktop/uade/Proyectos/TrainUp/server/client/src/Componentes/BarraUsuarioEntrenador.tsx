import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

const secciones = [
  { label: 'Mi Perfil', path: '/entrenador/perfil' },
  { label: 'Servicios', path: '/entrenador/servicios' },
  { label: 'Reseñas', path: '/entrenador/resenas' },
  { label: 'Estadísticas', path: '/entrenador/estadisticas' },
  { label: 'Solicitudes', path: '/entrenador/solicitudes' },
];

const BarraUsuarioEntrenador: React.FC = () => {
  const navigate = useNavigate();

  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px', 
    width: '100%',
    maxWidth: '775px',
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    backgroundColor: '#D9D9D9',
    borderRadius: '15px',
    overflow: 'hidden',
    width: '100%',
    height: '40px',
    maxWidth: '600px',
    position: 'relative',
    flexGrow: 1,
  };
  
  const navLinkStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'transparent',
    fontWeight: 600,
    cursor: 'pointer',
    zIndex: 2,
    transition: 'color 0.3s ease',
    textDecoration: 'none',
    color: '#FFFFFF',
    fontFamily: 'sans-serif',
  };
  
  const indicadorStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    height: '100%',
    width: `${100 / secciones.length}%`,
    backgroundColor: '#67A9FF',
    borderRadius: '15px',
    transition: 'left 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)',
    zIndex: 1,
  };
  
  const nuevoServicioButtonStyle: React.CSSProperties = {
    padding: '10px 10px',
    height: '40px',
    border: 'none',
    borderRadius: '15px',
    backgroundColor: '#000000',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontFamily: 'sans-serif',
  };
  
  return (
    <div style={wrapperStyle}>
      <div style={containerStyle}>
        {secciones.map((seccion, index) => (
          <NavLink
            key={seccion.label}
            to={seccion.path}
            style={navLinkStyle}
            className={({ isActive }) => (isActive ? 'active' : '')}
            data-index={index}
          >
            {seccion.label}
          </NavLink>
        ))}
        <div className="nav-indicador-entrenador" style={indicadorStyle} />
      </div>
      
      <button 
        style={nuevoServicioButtonStyle}
        onClick={() => navigate('/FormularioNuevoServicio')}
      >
        Crear Nuevo Servicio
      </button>
    </div>
  );
};

export default BarraUsuarioEntrenador;
