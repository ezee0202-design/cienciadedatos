import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Entrenador {
  _id: string;
  nombreCompleto: string;
  fotoPerfilUrl?: string;
}

const BuscadorEntrenadores = () => {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<Entrenador[]>([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);  // (ref para limpiar foco)

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (busqueda.trim() !== '') {
        axios
          .get(
            `http://localhost:5000/api/usuarios/buscar-entrenadores?nombre=${busqueda}`
          )
          .then((res) => {
            setResultados(res.data);
            setMostrarDropdown(true);
          })
          .catch((err) => console.error('Error al buscar entrenadores:', err));
      } else {
        setResultados([]);
        setMostrarDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [busqueda]);

  //Selección de un entrenador
  const handleSeleccion = (entrenador: Entrenador) => {
    // Si ya existe un id previo se elimina
    if (localStorage.getItem('entrenadorIdVistaCliente')) {
      localStorage.removeItem('entrenadorIdVistaCliente');
    }

    //Guarda el nuevo id
    localStorage.setItem('entrenadorIdVistaCliente', entrenador._id);

    //Limpia el buscador y cerramos el dropdown 
    setBusqueda('');          // vacía el texto del input
    setResultados([]);        // borra la lista para que no “parpadee” en la siguiente página
    setMostrarDropdown(false);
    inputRef.current?.blur();
    navigate(`/AcercaDe/${entrenador._id}`);
  };

  const estilos = {
    contenedor: {
      position: 'relative' as const,
      width: '300px',
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      fontSize: '14px',
    },
    dropdown: {
      position: 'absolute' as const,
      top: '100%',
      left: 0,
      right: 0,
      background: 'white',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      listStyle: 'none',
      margin: 0,
      padding: '0.5rem 0',
      zIndex: 1000,
    },
    item: (isHovered: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 12px',
      cursor: 'pointer',
      borderRadius: '6px',
      backgroundColor: isHovered ? '#f0f0f0' : 'transparent',
    }),
    avatar: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      objectFit: 'cover' as const,
    },
  };

  return (
    <div style={estilos.contenedor}>
      <input
        ref={inputRef}                    // conecta el ref
        type="text"
        placeholder="Buscar entrenador"
        style={estilos.input}
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {mostrarDropdown && resultados.length > 0 && (
        <ul style={estilos.dropdown}>
          {resultados.map((entrenador, index) => (
            <li
              key={entrenador._id}
              style={estilos.item(index === hoverIndex)}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
              onClick={() => handleSeleccion(entrenador)}
            >
              <img
                src={entrenador.fotoPerfilUrl || '/default-profile.png'}
                alt={entrenador.nombreCompleto}
                style={estilos.avatar}
              />
              {entrenador.nombreCompleto}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BuscadorEntrenadores;
