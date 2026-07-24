// BarraUsuarioCliente.tsx

import React from 'react';
import { NavLink } from 'react-router-dom';

const secciones = [
  { label: 'Mi Perfil', path: '/cliente/perfil' },
  { label: 'Mis Servicios', path: '/cliente/servicios' },
  { label: 'Mis Reseñas', path: '/cliente/resenas' },
];

const BarraUsuarioCliente: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    backgroundColor: '#D9D9D9',
    borderRadius: '15px',
    overflow: 'hidden',
    width: '100%',
    height: '40px',
    maxWidth: '600px',
    position: 'relative',
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
  
  return (
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
      
      <div className="nav-indicador-cliente" style={indicadorStyle} />
    </div>
  );
};

export default BarraUsuarioCliente;