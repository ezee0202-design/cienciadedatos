import React, { useEffect, useState } from 'react';
import './encabezado.css';
import logo from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from '../../assets/default-avatar.png';
import BuscadorEntrenadores from '../../Componentes/BuscadorEntrenadores';


const Encabezado = () => {
  const [usuario, setUsuario] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarUsuario = () => {
      const userData = localStorage.getItem('usuario');
      if (userData) {
        setUsuario(JSON.parse(userData));
      } else {
        setUsuario(null);
      }
    };

    cargarUsuario();
    window.addEventListener('loginExitoso', cargarUsuario);
    return () => window.removeEventListener('loginExitoso', cargarUsuario);
  }, []);

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    setUsuario(null);
    navigate('/');
  };

  return (
    <header className="encabezado">
      <div className="logo-contenedor" onClick={() => navigate('/')}>
  <img src={logo} alt="Logo" className="logoEncabezado" />
  <span className="nombre-app"><strong>TrainUp</strong></span>
</div>

      <div className="buscar-contenedor">
        <BuscadorEntrenadores />
      </div>

      {usuario ? (
        <div className="usuario-logueado">
          <img
            src={usuario.fotoPerfilUrl || defaultAvatar}
            alt="Foto de perfil"
            className="foto-perfil"
            onClick={() => {
              if (usuario.role === 'cliente') {
                navigate('/cliente/perfil');
              } else if (usuario.role === 'entrenador') {
                navigate('/entrenador/perfil');
              } else {
                navigate('/InfoPerfil');
              }
            }}
          />
          <span>{usuario.nombreCompleto}</span>
          <button className="boton-auth" onClick={() => navigate("/chat")}>
            Chat
          </button>
          <button className="boton-cerrar-sesion" onClick={handleCerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      ) : (
        <div className="botones-auth">
          <button className="boton-auth" onClick={() => navigate('LoginSesion')}>
            Ingresar
          </button>
          <button className="boton-auth" onClick={() => navigate('RegistrationForm')}>
            Registrarse
          </button>
        </div>
      )}
    </header>
  );
};

export default Encabezado;
