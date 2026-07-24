import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BarraUsuarioEntrenador from '../../../Componentes/BarraUsuarioEntrenador';
import AsistenciaSesionesEntrenador from './asistenciaSesionesEntrenador';
import axios from 'axios';

interface Sesion {
  fecha: string;
  hora: string;
  cliente: string;
  email: string;
  estado: string;
}

const AsistenciaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriaServicio, setCategoriaServicio] = useState<string>(''); // Nueva variable para categoría

  useEffect(() => {
    const fetchSesiones = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/reservas/por-servicio/${id}`);
        const reservas = response.data.reservas;
        const categoria = response.data.categoria || 'Servicio'; // Obtener categoría del backend

        setCategoriaServicio(categoria);

        const sesionesMapeadas: Sesion[] = reservas.map((r: any) => {
          const fechaObj = new Date(r.fechaPreferida);
          const fecha = fechaObj.toISOString().split('T')[0];
          const hora = r.horarioDeseado || '';

          return {
            fecha,
            hora,
            cliente: r.clienteId?.nombreCompleto || 'Sin nombre',
            email: r.clienteId?.email || 'Sin email',
            estado: r.estado || '(sin marcar)',
          };
        });

        setSesiones(sesionesMapeadas);
      } catch (err) {
        console.error(err);
        setError('Error al obtener sesiones.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSesiones();
    }
  }, [id]);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <BarraUsuarioEntrenador />
      </div>

      {loading ? (
        <p>Cargando sesiones...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <AsistenciaSesionesEntrenador
          titulo={`Asistencia para servicio: ${categoriaServicio}`}
          sesiones={sesiones}
        />
      )}
    </div>
  );
};

export default AsistenciaPage;
