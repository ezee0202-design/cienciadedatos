import React, { useEffect, useState } from 'react';
import axios from 'axios';
import InfoPerfilEntrenador from './infoPerfilEntrenador';
import defaultAvatar from '../../../assets/foto-perfil-default.png';
import { useNavigate } from 'react-router-dom';

const DashboardEntrenador: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        console.warn('Token no encontrado. Redirigiendo al login...');
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/usuarios/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data);
      } catch (err: any) {
        console.error('Error al obtener perfil:', err);
        if (err.response?.status === 401) {
          alert('Sesión expirada. Iniciá sesión nuevamente.');
          localStorage.removeItem('token');
          navigate('/LoginSesion');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) return <div>Cargando perfil...</div>;
  if (!user) return <div>No se pudo cargar el perfil.</div>;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.content}>
        <InfoPerfilEntrenador
          nombre={user.nombreCompleto}
          fechaNacimiento={new Date(user.FechaNacimiento).toLocaleDateString()}
          certificaciones={user.certificaciones || []}
          descripcion={user.descripcion || ''}
          fotoPerfilUrl={user.fotoPerfilUrl || defaultAvatar}
        />
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    gap: '20px',
    marginLeft:'320px',
  },
  navContainer: {
    flexGrow: 1,
  },
  botonNegro: {
    backgroundColor: 'black',
    color: 'white',
    borderRadius: '10px',
    padding: '10px 20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
  },
};

export default DashboardEntrenador;
