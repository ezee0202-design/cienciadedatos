"use client"

import type React from "react"
import type { Conversacion } from "../../types"
import defaultAvatar from "../../assets/default-avatar.png"
import "./ConversacionesList.css"

interface ConversacionesListProps {
  conversaciones: Conversacion[]
  onSelectConversacion: (conversacion: Conversacion) => void
}

const ConversacionesList: React.FC<ConversacionesListProps> = ({ conversaciones, onSelectConversacion }) => {
  return (
    <div className="conversaciones-list">
      {conversaciones.map((conversacion) => (
        <div key={conversacion.id} className="conversacion-item" onClick={() => onSelectConversacion(conversacion)}>
          <div className="conversacion-avatar">
            <img src={conversacion.participante.avatar || defaultAvatar} alt={conversacion.participante.nombre} />
          </div>
          <div className="conversacion-info">
            <div className="conversacion-nombre">{conversacion.participante.nombre}</div>
            <div className="conversacion-ultimo-mensaje">
              {conversacion.ultimoMensaje?.contenido || "Nueva conversación"}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ConversacionesList
