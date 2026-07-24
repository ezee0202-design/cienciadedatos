// MisReseñasCliente.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReseñaCardCliente from './ReseñaCardCliente';
import './misReseñasCliente.css';

const MisReseñasCliente: React.FC = () => {
    const [reseñas, setReseñas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    const fetchReseñas = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/resenas/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            if (!response.ok) {
                throw new Error('Error al obtener las reseñas.');
            }
            
            const data = await response.json();
            setReseñas(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchReseñas();
    }, [fetchReseñas]);

    if (loading) {
        return <div className="loading-container">Cargando tus reseñas...</div>;
    }

    return (
        <div className="mis-reseñas-container">
            <h2>Mis Reseñas</h2>
            {reseñas.length > 0 ? (
                reseñas.map(reseña => (
                    <ReseñaCardCliente 
                        key={reseña._id} 
                        reseña={reseña}
                    />
                ))
            ) : (
                <p>Aún no has escrito ninguna reseña.</p>
            )}
        </div>
    );
};

export default MisReseñasCliente;