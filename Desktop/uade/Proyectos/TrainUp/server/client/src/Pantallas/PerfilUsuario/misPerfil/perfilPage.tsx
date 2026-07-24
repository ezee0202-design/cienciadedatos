// PerfilPage.tsx

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import InfoPerfil from './infoPerfilCliente'; 
import defaultAvatar from '../../../assets/foto-perfil-default.png';

const PerfilPage: React.FC = () => {
  const { user } : { user: any } = useOutletContext();
  
  return (
    <InfoPerfil
      nombreApellido={user.nombreCompleto || `${user.nombre} ${user.apellido}`}
      correoElectronico={user.email}
      fechaNacimiento={new Date(user.FechaNacimiento).toLocaleDateString()}
      numeroCelular={user.numeroCelular}
      alturaCm={user.alturaCm}
      pesoKg={user.pesoKg}
      fotoPerfilUrl={user.fotoPerfilUrl || defaultAvatar}
    />
  );
};

export default PerfilPage;
