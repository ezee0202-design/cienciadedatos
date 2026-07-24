import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"

import Encabezado from "./Pantallas/Home/encabezado"
import Home from "./Pantallas/Home/page"
import RegistrationForm from "./Pantallas/Registro/registrationForm"
import LoginSesion from "./Pantallas/Login/loginSesion"
import OlvideContraseña from "./Pantallas/Login/olvideContraseña"

import CardInfoServicio from "./Pantallas/InfoServicio/cardInfoServicio"
import FinalizarCompra from "./Pantallas/CompraServicio/finalizarCompra"

import ServiciosDisponiblesEntrenador from "./Pantallas/PerfilEntrenador/serviciosDisponibles/page"
import EntrenadorLayout from "./Pantallas/PerfilEntrenador/EntrenadorLayout/EntrenadorLayout"
import InfoPerfilEntrenador from "./Pantallas/PerfilEntrenador/PerfilVistaEntrenador/page"
import EditarPerfilEntrenador from "./Pantallas/PerfilEntrenador/PerfilVistaEntrenador/editarPerfilEntrenador"
import MisServiciosEntrenador from "./Pantallas/PerfilEntrenador/servicios/pageServicios"
import ReceñasRecibidasEntrenador from "./Pantallas/PerfilEntrenador/reseñas/page"
import EstadisticasEntrenador from "./Pantallas/PerfilEntrenador/estadisticas/page"
import SolicitudEntrenador from "./Pantallas/PerfilEntrenador/solicitudes/page"
import AsistenciaSesionesEntrenador from "./Pantallas/PerfilEntrenador/servicios/pageAsistencia"
import FormularioNuevoServicio from "./Pantallas/PerfilEntrenador/NuevoServicio/formularioNuevoServicio"
import FormularioEditarServicio from "./Pantallas/PerfilEntrenador/servicios/FormularioEditarServicio"
import ReseñasConRespuesta from "./Pantallas/PerfilEntrenador/reseñasEntrenador/page"
import AcercaDe from "./Pantallas/PerfilEntrenador/acercaDe/page"

import LayoutPerfilCliente from "./Pantallas/PerfilUsuario/UsuarioLayout/usuarioLayout"
import PerfilCliente from "./Pantallas/PerfilUsuario/misPerfil/perfilPage"
import EditarPerfilCliente from "./Pantallas/PerfilUsuario/misPerfil/editarPerfilCliente"
import MisServiciosCliente from "./Pantallas/PerfilUsuario/misServicios/MisServiciosCliente"
import MisReseñasCliente from "./Pantallas/PerfilUsuario/misReseñas/misReseñasCliente"

import ChatPage from "./Pantallas/Chat/ChatPage"

function App() {
  return (
    <div className="app-container">
      <Encabezado />
      <div className="app-content">
        <Routes>
          {/* Página principal y autenticación */}
          <Route path="/" element={<Home />} />
          <Route path="/RegistrationForm" element={<RegistrationForm />} />
          <Route path="/LoginSesion" element={<LoginSesion />} />
          <Route path="/olvide-contraseña" element={<OlvideContraseña />} />
          <Route path="/restablecer-password/:token" element={<OlvideContraseña />} />

          {/* Chat */}
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:participanteId" element={<ChatPage />} />

          {/* Información de servicios y compra */}
          <Route path="/servicio/:id" element={<CardInfoServicio />} />
          <Route path="/FinalizarCompra/:id" element={<FinalizarCompra />} />
          <Route path="/ServiciosDisponiblesEntrenador/:id" element={<ServiciosDisponiblesEntrenador />} />
          <Route path="/AcercaDe/:id" element={<AcercaDe />} />
          <Route path="/ResenasConRespuesta/:id" element={<ReseñasConRespuesta />} />

          {/* Entrenador - rutas anidadas */}
          <Route path="/entrenador" element={<EntrenadorLayout />}>
            <Route index element={<Navigate to="perfil" replace />} />
            <Route path="perfil" element={<InfoPerfilEntrenador />} />
            <Route path="editar-perfil" element={<EditarPerfilEntrenador />} />
            <Route path="servicios" element={<MisServiciosEntrenador />} />
            <Route path="resenas" element={<ReceñasRecibidasEntrenador />} />
            <Route path="estadisticas" element={<EstadisticasEntrenador />} />
            <Route path="solicitudes" element={<SolicitudEntrenador />} />
          </Route>

          {/* Entrenador - rutas independientes */}
          <Route path="/MisServiciosEntrenador" element={<MisServiciosEntrenador />} />
          <Route path="/AsistenciaSesionesEntrenador/:id" element={<AsistenciaSesionesEntrenador />} />
          <Route path="/EstadisticasEntrenador" element={<EstadisticasEntrenador />} />
          <Route path="/RecenasRecibidasEntrenador" element={<ReceñasRecibidasEntrenador />} />
          <Route path="/SolicitudEntrenador" element={<SolicitudEntrenador />} />
          <Route path="/FormularioNuevoServicio" element={<FormularioNuevoServicio />} />
          <Route path="/editar-servicio/:id" element={<FormularioEditarServicio />} />

          {/* Cliente */}
          <Route path="/cliente" element={<LayoutPerfilCliente />}>
            <Route index element={<Navigate to="perfil" replace />} />
            <Route path="perfil" element={<PerfilCliente />} />
            <Route path="editar-perfil" element={<EditarPerfilCliente />} />
            <Route path="servicios" element={<MisServiciosCliente />} />
            <Route path="resenas" element={<MisReseñasCliente />} />
          </Route>
        </Routes>
      </div>
    </div>
  )
}

export default App
