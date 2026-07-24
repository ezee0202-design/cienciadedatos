import React from 'react';
import './asistenciaSesionesEntrenador.css';

interface Sesion {
  fecha: string;
  hora: string;
  cliente: string;
  email: string;
  estado: string;
}

interface Props {
  titulo: string;
  sesiones: Sesion[];
}

function AsistenciaSesionesEntrenador({ titulo, sesiones }: Props) {
  

  return (
    <div className="asistencia-simple">
      <h2>{titulo}</h2>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Cliente</th>
            <th>Email</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {sesiones.map((s, i) => (
            <tr key={i}>
              <td>{s.fecha}</td>
              <td>{s.hora}</td>
              <td>{s.cliente}</td>
              <td>{s.email}</td>
              <td>{s.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
     
    </div>
  );
}

export default AsistenciaSesionesEntrenador;
