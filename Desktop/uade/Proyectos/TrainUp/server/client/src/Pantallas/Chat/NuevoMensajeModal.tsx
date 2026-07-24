"use client"

import type React from "react"
import { useState } from "react"
import { X, Search } from "lucide-react"
import "./NuevoMensajeModal.css"

interface NuevoMensajeModalProps {
  onClose: () => void
  onNuevaConversacion: (participanteId: string) => void
}

const NuevoMensajeModal: React.FC<NuevoMensajeModalProps> = ({ onClose, onNuevaConversacion }) => {
  const [email, setEmail] = useState("")
  const [usuario, setUsuario] = useState<any>(null)
  const [mensaje, setMensaje] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const buscarUsuario = async () => {
    if (!email.trim()) return

    setLoading(true)
    setError("")
    setUsuario(null)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/chat/buscar-usuario/${email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsuario(data)
      } else {
        setError("Usuario no encontrado")
      }
    } catch (error) {
      setError("Error al buscar usuario")
    } finally {
      setLoading(false)
    }
  }

  const enviarMensaje = async () => {
    if (!usuario || !mensaje.trim()) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/chat/enviar-mensaje", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          participanteId: usuario._id,
          contenido: mensaje,
        }),
      })

      if (response.ok) {
        onNuevaConversacion(usuario._id)
      }
    } catch (error) {
      setError("Error al enviar mensaje")
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Nuevo Mensaje</h3>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="buscar-usuario">
            <label>Email del destinatario:</label>
            <div className="input-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                onKeyPress={(e) => e.key === "Enter" && buscarUsuario()}
              />
              <button onClick={buscarUsuario} disabled={loading}>
                <Search size={16} />
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {usuario && (
            <div className="usuario-encontrado">
              <img
                src={usuario.fotoPerfilUrl || "/default-avatar.png"}
                alt={usuario.nombreCompleto}
                className="usuario-avatar"
              />
              <div className="usuario-info">
                <h4>{usuario.nombreCompleto}</h4>
                <p>{usuario.email}</p>
              </div>
            </div>
          )}

          {usuario && (
            <div className="mensaje-input">
              <label>Mensaje:</label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Escribe tu mensaje..."
                rows={4}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-cancelar">
            Cancelar
          </button>
          <button onClick={enviarMensaje} className="btn-enviar" disabled={!usuario || !mensaje.trim()}>
            Enviar Mensaje
          </button>
        </div>
      </div>
    </div>
  )
}

export default NuevoMensajeModal
