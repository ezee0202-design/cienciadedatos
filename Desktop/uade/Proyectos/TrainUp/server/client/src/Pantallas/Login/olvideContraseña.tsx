"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import "./olvideContraseña.css"

interface ResetPasswordScreenProps {
  onSendEmail?: (email: string) => void
  onGoBack?: () => void
}

function ResetPasswordScreen({ onSendEmail, onGoBack }: ResetPasswordScreenProps) {
  const [email, setEmail] = useState("")
  const [step, setStep] = useState<"email" | "token" | "success">("email")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()

  useEffect(() => {
    if (token) {
      setStep("token")
    }
  }, [token])

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("http://localhost:5000/api/usuarios/recuperar-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Se ha enviado un enlace de recuperación a tu email")

        if (data.previewUrl) {
          console.log(" Preview del email:", data.previewUrl)
          setMessage(
            `Se ha enviado un enlace de recuperación a tu email. En desarrollo, puedes ver el email aquí: ${data.previewUrl}`
          )
        }
      } else {
        setMessage(data.mensaje || "Error al enviar el email")
      }
    } catch (error) {
      setMessage("Error de conexión. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }

    if (onSendEmail) onSendEmail(email.trim())
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setMessage("Las contraseñas no coinciden")
      return
    }

    if (newPassword.length < 8) {
      setMessage("La contraseña debe tener al menos 8 caracteres")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch(`http://localhost:5000/api/usuarios/restablecer-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevaContraseña: newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setStep("success")
        setMessage("Contraseña restablecida correctamente")
      } else {
        setMessage(data.mensaje || "Error al restablecer la contraseña")
      }
    } catch (error) {
      setMessage("Error de conexión. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  if (step === "success") {
    return (
      <div className="reset-password-screen-container">
        <div className="reset-password-card">
          <h1 className="reset-password-title">¡Contraseña Restablecida!</h1>
          <p className="reset-password-subtitle">Tu contraseña ha sido restablecida correctamente.</p>
          <button className="send-email-button" onClick={() => navigate("/LoginSesion")}>
            Ir al Login
          </button>
        </div>
      </div>
    )
  }

  if (step === "token") {
    return (
      <div className="reset-password-screen-container">
        <div className="reset-password-card">
          <h1 className="reset-password-title">Nueva Contraseña</h1>
          <p className="reset-password-subtitle">Ingresa tu nueva contraseña.</p>

          <form onSubmit={handleResetPassword} className="reset-password-form">
            <label htmlFor="new-password-input" className="form-label">Nueva Contraseña</label>
            <div className="password-containerLGN">
              <input
                type={showPassword ? "text" : "password"}
                id="new-password-input"
                className="form-input"
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggleLGN"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <label htmlFor="confirm-password-input" className="form-label">Confirmar Contraseña</label>
            <div className="password-containerLGN">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirm-password-input"
                className="form-input"
                placeholder="Confirma tu nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggleLGN"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button type="submit" className="send-email-button" disabled={loading}>
              {loading ? "Restableciendo..." : "Restablecer Contraseña"}
            </button>
          </form>

          {message && <div className={`message ${message.includes("Error") ? "error" : "success"}`}>{message}</div>}

          <button type="button" className="go-back-button" onClick={() => navigate("/LoginSesion")}>
            Volver al Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="reset-password-screen-container">
      <div className="reset-password-card">
        <h1 className="reset-password-title">Restablecer contraseña</h1>
        <p className="reset-password-subtitle">Se enviará un email para que puedas cambiar tu contraseña.</p>

        <form onSubmit={handleSendEmail} className="reset-password-form">
          <label htmlFor="email-input" className="form-label">Ingrese su Email</label>
          <input
            type="email"
            id="email-input"
            className="form-input"
            placeholder="usuario@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="send-email-button" disabled={loading}>
            {loading ? "Enviando..." : "Enviar email"}
          </button>
        </form>

        {message && <div className={`message ${message.includes("Error") ? "error" : "success"}`}>{message}</div>}

        <button type="button" className="go-back-button" onClick={() => navigate("/LoginSesion")}>
          Volver al Login
        </button>
      </div>
    </div>
  )
}

export default ResetPasswordScreen
