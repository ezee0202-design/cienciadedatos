'use client';

import React, { useEffect, useState } from 'react';
import Filtro from './filtro';
import CardFiltros from './cardFiltros';
import { useNavigate } from 'react-router-dom';
import './page.css';

/* ---------- Tipos ---------- */
type Servicio = {
  _id: string;
  categoria: string;
  duracion: number;
  diasDisponibles: string;
  rangoHorario: string;
  idioma: string;
  zona: string;
  modalidad: string;
  precio: number;
  descripcion: string;
  imagenServicio?: string;
  entrenador?: { nombreCompleto: string };
};

type ServicioConRating = Servicio & {
  promedio: number;      // 0‑5
  cantidad: number;      // nº de reseñas
};

export default function HomePage() {
  const [servicios, setServicios] = useState<ServicioConRating[]>([]);
  const [category,  setCategory]  = useState('Todas las categorías');
  const [price,     setPrice]     = useState(30000);
  const [duration,  setDuration]  = useState(480);
  const [zone,      setZone]      = useState('Seleccione una zona');
  const [modality,  setModality]  = useState('Seleccione la modalidad');
  const [language,  setLanguage]  = useState('Seleccione el idioma');
 const [rating,    setRating]    = useState('');   

  const navigate = useNavigate();

  /* ---------- carga inicial ---------- */
  useEffect(() => { fetchServicios(); }, []);

  /* ---------- helpers ---------- */
  const fetchPromedioServicio = async (id: string) => {
    const res = await fetch(`http://localhost:5000/api/resenas/promedio-servicio/${id}`);
    return res.json(); // { promedio, cantidad }
  };

  const fetchServicios = async (query: string = '') => {
    try {
      const res = await fetch(`http://localhost:5000/api/servicios${query}`);
      const data: Servicio[] = await res.json();

      /* Traer ratings en paralelo */
      const completos: ServicioConRating[] = await Promise.all(
        data.map(async (srv) => {
          const { promedio, cantidad } = await fetchPromedioServicio(srv._id);
          return { ...srv, promedio, cantidad };
        })
      );

      setServicios(completos);
    } catch (err) {
      console.error('Error cargando servicios:', err);
    }
  };

  /* ---------- filtro ---------- */
 const handleBuscar = async () => {
  const qp = new URLSearchParams({
    categoria: category !== 'Todas las categorías' ? category : '',
    precio:    price.toString(),
    duracion:  duration.toString(),
    zona:      zone     !== 'Seleccione una zona'     ? zone     : '',
    modalidad: modality !== 'Seleccione la modalidad' ? modality : '',
    idioma:    language !== 'Seleccione el idioma'    ? language : '',
  }).toString();

  try {
    const res = await fetch(`http://localhost:5000/api/servicios?${qp}`);
    const data: Servicio[] = await res.json();

    // Traer ratings en paralelo
    const completos: ServicioConRating[] = await Promise.all(
      data.map(async (srv) => {
        const { promedio, cantidad } = await fetchPromedioServicio(srv._id);
        return { ...srv, promedio, cantidad };
      })
    );

    if (rating === '') {
      // Mostrar todos sin filtrar localmente por rating
      setServicios(completos);
    } else {
      // Filtrar localmente por rating en rangos
      const bucket = parseInt(rating, 10);
      const filtrados = completos.filter(s =>
        bucket === 5
          ? s.promedio >= 5
          : s.promedio >= bucket && s.promedio < bucket + 1
      );
      setServicios(filtrados);
    }
  } catch (err) {
    console.error('Error buscando servicios:', err);
  }
};

  /* ---------- render ---------- */
  return (
    <main className="main-container">
      {/* Fondo azul detrás del encabezado */}
      <div className="header-background"></div>

      {/* Header */}
      <section className="header-section">
        <div className="header-content">
          <h1 className="header-title">
            Conecta con los mejores entrenadores personales
          </h1>
          <p className="header-subtitle">
            Encontrá entrenadores especializados en running, gimnasio, nutrición, yoga y más.
            Mejorá tu salud y alcanzá tus objetivos fitness con profesionales calificados.
          </p>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="content-section">
        {/* Filtro */}
        <aside className="filter-aside">
          <Filtro
            category={category} setCategory={setCategory}
            price={price} setPrice={setPrice}
            duration={duration} setDuration={setDuration}
            zone={zone} setZone={setZone}
            modality={modality} setModality={setModality}
            language={language} setLanguage={setLanguage}
            rating={rating} setRating={setRating}
            onBuscar={handleBuscar}
          />
        </aside>

        {/* Cards */}
        <section className="cards-section">
          {servicios.map(s => (
            <CardFiltros
  key={s._id}
  logo={s.imagenServicio ?? "/icons/default.svg"}
  titulo={s.categoria}
/* ↓ zona, modalidad e idioma en el array  */
  tags={[s.zona, s.modalidad, s.idioma]}
  descripcion={s.descripcion}
  entrenador={s.entrenador?.nombreCompleto || "Entrenador"}
  precio={s.precio}
  duracion={`${s.duracion} min`}
  rating={s.promedio}
  reviewsCount={s.cantidad}
  onClick={() => navigate(`/servicio/${s._id}`)}
/>
          ))}
        </section>
      </section>

      {/* Footer */}
      <footer className="footer-section">
        <div className="footer-content">
          <div className="footer-left">
            <h3>TrainUp</h3>
            <p>
              Conectando entrenadores personales con clientes que buscan alcanzar sus metas de salud y bienestar.
              Encontrá a tu entrenador ideal con nuestras herramientas de búsqueda y filtros inteligentes.
            </p>
          </div>
          <div className="footer-right">
            <p className="footer-link">Términos y Condiciones</p>
            <p className="footer-link">Política de Privacidad</p>
            <p className="footer-link">Política de Cookies</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
