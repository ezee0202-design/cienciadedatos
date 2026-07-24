// ClienteLayout.tsx

import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BarraUsuarioCliente from '../../../Componentes/BarraUsuarioCliente';

const ClienteLayout: React.FC = () => {
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
            console.error('Error al obtener perfil del cliente:', err);
            if (err.response?.status === 401) {
            alert('Sesión expirada. Iniciá sesión nuevamente.');
            localStorage.removeItem('token');
            navigate('/login');
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
            <div style={styles.topBar}>
                <BarraUsuarioCliente />
            </div>
            <main style={styles.content}>
                <Outlet context={{ user: user }} />
            </main>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: {
        width: '100%',
    },
    topBar: {
        paddingTop: '30px',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'center',
    },
    content: {
        display: 'flex',
        justifyContent: 'center',
        padding: '0 20px 40px 20px',
    },
};

export default ClienteLayout;
