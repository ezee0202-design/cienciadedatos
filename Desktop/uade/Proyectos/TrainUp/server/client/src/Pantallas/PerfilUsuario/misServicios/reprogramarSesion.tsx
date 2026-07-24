// ReprogramarSesion.tsx

import React, { useState } from 'react';
import './reprogramarSesion.css';

interface ReprogramarSesionProps {
    booking: any;
    onClose: () => void;
    onSuccess: () => void;
}

const ReprogramarSesion: React.FC<ReprogramarSesionProps> = ({ booking, onClose, onSuccess }) => {
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleConfirm = async () => {
        if (!newDate || !newTime) {
            setError('Por favor, completa la fecha y la hora.');
            return;
        }
    
    setIsLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
        setError("Error de autenticación. Por favor, inicia sesión de nuevo.");
        setIsLoading(false);
        return;
    }
    
    const fechaParaEnviar = new Date(`${newDate}T${newTime}:00`);
    
    try {
        const dateResponse = await fetch(`http://localhost:3000/api/reservas/${booking._id}/date`, {
            method: 'PATCH',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
            fecha: fechaParaEnviar,
            hora: newTime,
            }),
        });
        
        if (!dateResponse.ok) {
            throw new Error('No se pudo actualizar la fecha. Inténtalo de nuevo.');
        }
        
        if (booking.estado !== 'pendiente') {
            const statusResponse = await fetch(`http://localhost:3000/api/reservas/${booking._id}/status`, {
                method: 'PATCH',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                estado: 'pendiente',
                }),
            });
            
            if (!statusResponse.ok) {
                throw new Error('La fecha se actualizó, pero no se pudo cambiar el estado.');
            }
        }
        
        alert('¡Sesión reprogramada con éxito! El entrenador debe confirmar la nueva fecha.');
        onSuccess(); 
        onClose();
    
    } catch (err: any) {
        setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
        setIsLoading(false);
    }
};

return (
    <div className="modal-overlay">
        <div className="modal-content">
            <h2>Reprogramar Sesión</h2>
            <h3>{booking.servicioId.descripcion}</h3>
            <p>Duración: {booking.servicioId.duracion} minutos | Zona: {booking.servicioId.zona}</p>
            
            <div className="input-row">
                <div className="form-group">
                    <label htmlFor="fecha">Fecha preferida</label>
                    <input
                        type="date"
                        id="fecha"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="hora">Horario deseado</label>
                    <input
                        type="time"
                        id="hora"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        step="1800"
                    />
                </div>
            </div>
            
            {error && <p className="error-message">{error}</p>}
            
            <div className="modal-actions">
                <button onClick={handleConfirm} disabled={isLoading} className='button'>{isLoading ? 'Confirmando...' : 'Confirmar'}</button>
                <button onClick={onClose} disabled={isLoading} className="button">Cancelar</button>
            </div>
        </div>
    </div>
    );
};

export default ReprogramarSesion;