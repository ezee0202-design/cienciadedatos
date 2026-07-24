"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Send, Paperclip, Download, Eye } from "lucide-react"
import defaultAvatar from "../../assets/default-avatar.png"
import ImageViewer from "./ImageViewer"
import "./ChatWindow.css"

interface Mensaje {
  id: string
  contenido: string
  esPropio: boolean
  timestamp: string
  tipoArchivo?: string
  archivoUrl?: string
  nombreArchivo?: string
}

interface ChatWindowProps {
  participanteId: string
  onNuevoMensaje?: () => void
}

const ChatWindow = ({ participanteId, onNuevoMensaje }: ChatWindowProps) => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [nuevoMensaje, setNuevoMensaje] = useState("")
  const [participante, setParticipante] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [imagenViewer, setImagenViewer] = useState<string | null>(null)
  const mensajesRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (participanteId) {
      cargarConversacion()
    }
  }, [participanteId])

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight
    }
  }, [mensajes])

  const cargarConversacion = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/chat/conversacion/${participanteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMensajes(data.mensajes || [])

        // Obtener información del participante (el otro usuario, no el actual)
        const usuarioActual = JSON.parse(localStorage.getItem("usuario") || "{}")
        const otroParticipante = data.participantes?.find((p: any) => p._id !== usuarioActual.id)
        setParticipante(otroParticipante)
      }
    } catch (error) {
      console.error("Error al cargar conversación:", error)
    } finally {
      setLoading(false)
    }
  }

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/chat/enviar-mensaje", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          participanteId,
          contenido: nuevoMensaje,
        }),
      })

      if (response.ok) {
        setNuevoMensaje("")
        cargarConversacion()
        onNuevoMensaje?.()
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error)
    }
  }

  const enviarArchivo = async (file: File) => {
    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("archivo", file)
      formData.append("participanteId", participanteId)

      const response = await fetch("http://localhost:5000/api/chat/enviar-archivo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        cargarConversacion()
        onNuevoMensaje?.()
      }
    } catch (error) {
      console.error("Error al enviar archivo:", error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      enviarArchivo(file)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje()
    }
  }

  const renderMensaje = (mensaje: Mensaje) => {
    if (mensaje.tipoArchivo === "imagen") {
      return (
        <div className="mensaje-archivo">
          <img
            src={`http://localhost:5000${mensaje.archivoUrl}`}
            alt={mensaje.nombreArchivo}
            className="mensaje-imagen"
            onClick={() => setImagenViewer(`http://localhost:5000${mensaje.archivoUrl}`)}
          />
          <p className="nombre-archivo">{mensaje.nombreArchivo}</p>
        </div>
      )
    } else if (mensaje.tipoArchivo === "pdf") {
      return (
        <div className="mensaje-archivo">
          <div className="archivo-pdf">
            <div className="pdf-icon">📄</div>
            <div className="archivo-info">
              <p className="nombre-archivo">{mensaje.nombreArchivo}</p>
              <div className="archivo-acciones">
                <button
                  onClick={() => window.open(`http://localhost:5000${mensaje.archivoUrl}`, "_blank")}
                  className="btn-archivo"
                >
                  <Eye size={16} /> Ver
                </button>
                <a
                  href={`http://localhost:5000${mensaje.archivoUrl}`}
                  download={mensaje.nombreArchivo}
                  className="btn-archivo"
                >
                  <Download size={16} /> Descargar
                </a>
              </div>
            </div>
          </div>
        </div>
      )
    } else if (mensaje.tipoArchivo) {
      return (
        <div className="mensaje-archivo">
          <div className="archivo-documento">
            <div className="doc-icon">📎</div>
            <div className="archivo-info">
              <p className="nombre-archivo">{mensaje.nombreArchivo}</p>
              <a
                href={`http://localhost:5000${mensaje.archivoUrl}`}
                download={mensaje.nombreArchivo}
                className="btn-archivo"
              >
                <Download size={16} /> Descargar
              </a>
            </div>
          </div>
        </div>
      )
    }

    return <p className="chat-mensaje-contenido">{mensaje.contenido}</p>
  }

  if (loading) {
    return <div className="chat-loading">Cargando conversación...</div>
  }

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <img
          src={participante?.fotoPerfilUrl || defaultAvatar}
          alt={participante?.nombreCompleto}
          className="chat-avatar"
        />
        <h3 className="chat-nombre">{participante?.nombreCompleto || "Usuario"}</h3>
      </div>

      {/* Mensajes */}
      <div ref={mensajesRef} className="chat-mensajes-container">
        {mensajes.map((mensaje) => (
          <div key={mensaje.id} className={`chat-mensaje ${mensaje.esPropio ? "propio" : "otro"}`}>
            {renderMensaje(mensaje)}
            <span className="chat-mensaje-timestamp">
              {new Date(mensaje.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input-container">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: "none" }}
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
        <button onClick={() => fileInputRef.current?.click()} className="chat-attach-button" title="Adjuntar archivo">
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe un mensaje..."
          className="chat-input"
        />
        <button onClick={enviarMensaje} className="chat-send-button">
          <Send size={20} />
        </button>
      </div>

      {/* Image Viewer */}
      {imagenViewer && <ImageViewer src={imagenViewer || "/placeholder.svg"} onClose={() => setImagenViewer(null)} />}
    </div>
  )
}

export default ChatWindow
