"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Plus } from "lucide-react"
import ConversacionesList from "./ConversacionesList"
import ChatWindow from "./ChatWindow"
import NuevoMensajeModal from "./NuevoMensajeModal"
import type { Conversacion } from "../../types"
import "./ChatPage.css"

const ChatPage: React.FC = () => {
  const { participanteId } = useParams()
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([])
  const [conversacionActiva, setConversacionActiva] = useState<string | null>(participanteId || null)
  const [loading, setLoading] = useState(true)
  const [mostrarNuevoMensaje, setMostrarNuevoMensaje] = useState(false)

  useEffect(() => {
    fetchConversaciones()
  }, [])

  const fetchConversaciones = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/chat/conversaciones", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setConversaciones(data)
      }
    } catch (error) {
      console.error("Error al cargar conversaciones:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSeleccionarConversacion = (conversacion: Conversacion) => {
    setConversacionActiva(conversacion.participante.id)
  }

  const handleNuevoMensaje = () => {
    fetchConversaciones()
  }

  const handleNuevaConversacion = (participanteId: string) => {
    setConversacionActiva(participanteId)
    setMostrarNuevoMensaje(false)
    fetchConversaciones()
  }

  if (loading) {
    return <div className="chat-loading">Cargando chat...</div>
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="conversaciones-sidebar">
          <div className="conversaciones-header">
            <h2>Mensajes</h2>
            <button className="nuevo-mensaje-btn" onClick={() => setMostrarNuevoMensaje(true)} title="Nuevo mensaje">
              <Plus size={20} />
            </button>
          </div>
          <ConversacionesList conversaciones={conversaciones} onSelectConversacion={handleSeleccionarConversacion} />
        </div>

        {conversacionActiva ? (
          <ChatWindow participanteId={conversacionActiva} onNuevoMensaje={handleNuevoMensaje} />
        ) : (
          <div className="chat-placeholder">
            <h3>Selecciona una conversación para comenzar</h3>
            <p>O inicia una nueva conversación haciendo clic en el botón +</p>
          </div>
        )}
      </div>

      {mostrarNuevoMensaje && (
        <NuevoMensajeModal
          onClose={() => setMostrarNuevoMensaje(false)}
          onNuevaConversacion={handleNuevaConversacion}
        />
      )}
    </div>
  )
}

export default ChatPage
