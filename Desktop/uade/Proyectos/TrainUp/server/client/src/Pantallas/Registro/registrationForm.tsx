"use client"

import React, { useState } from "react"
import { Eye, EyeOff, Check, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import "./RegistroStyle.css"   // ⬅️  nuevo stylesheet

interface PasswordValidation {
  length: boolean
  uppercase: boolean
  number: boolean
  special: boolean
}

export default function RegistrationForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
    isTrainer: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const maxDate = `${yyyy - 18}-${mm}-${dd}`;
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  })

  /* ───────── Validaciones ───────── */
  const validatePassword = (password: string): PasswordValidation => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  })
  const isPasswordValid = (v: PasswordValidation) =>
    v.length && v.uppercase && v.number && v.special

  /* ───────── Handlers ───────── */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === "password") setPasswordValidation(validatePassword(value))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((p) => ({ ...p, isTrainer: e.target.checked }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!isPasswordValid(passwordValidation)) {
      alert("La contraseña no cumple con los requisitos de seguridad")
      setIsLoading(false)
      return
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    const datosAEnviar = {
      email: formData.email,
      contraseña: formData.password,
      nombreCompleto: formData.fullName,
      FechaNacimiento: formData.birthDate,
      role: formData.isTrainer ? "entrenador" : "cliente",
    }

    try {
      const res = await fetch("http://localhost:5000/api/usuarios/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosAEnviar),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.mensaje || `Error ${res.status}`)
      }
      alert("Usuario registrado correctamente")
      navigate("/LoginSesion")
    } catch (err: any) {
      const msg =
        err?.message?.includes("fetch") || err?.message?.includes("Network")
          ? "No se puede conectar con el servidor. Verifica que el backend esté activo."
          : `Error al registrar: ${err.message || "desconocido"}`
      alert(msg)
    } finally {
      setIsLoading(false)
    }
  }

  /* ───────── Icono OK / X reutilizable ───────── */
  const ValidationIcon = ({ isValid }: { isValid: boolean }) =>
    isValid ? (
      <Check className="validation-iconRGS valid" size={16} />
    ) : (
      <X className="validation-iconRGS invalid" size={16} />
    )

  /* ───────── Render ───────── */
  return (
    <div className="form-containerRegistroRGS">
      <h1 className="form-titleRGS">Crear una cuenta</h1>
      <p className="form-subtitleRGS">
        Regístrate para acceder a todos
        <br />
        los servicios de TrainUp
      </p>

      <form onSubmit={handleSubmit} className="formRGS">
        {/* Email */}
        <div className="form-groupRGS">
          <label htmlFor="email" className="form-labelRGS">
            Ingrese su Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="usuario@ejemplo.com"
            className="form-inputRGS"
            required
          />
        </div>

        {/* Nombre completo */}
        <div className="form-groupRGS">
          <label htmlFor="fullName" className="form-labelRGS">
            Nombre Completo
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            className="form-inputRGS"
            required
            maxLength={40} // Limita a 40 caracteres
          />
        </div>

        {/* Fecha de nacimiento */}
        <div className="form-groupRGS">
          <label htmlFor="birthDate" className="form-labelRGS">
            Fecha de nacimiento
          </label>
          <input
            id="birthDate"
            name="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={handleChange}
            className="form-inputRGS"
            required
            max={maxDate}
          />
        </div>

        {/* Contraseña */}
        <div className="form-groupRGS">
          <label htmlFor="password" className="form-labelRGS">
            Ingrese su Contraseña
          </label>
          <div className="password-containerRGS">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              className="form-inputRGS"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggleRGS"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {formData.password && (
            <div className="password-validationRGS">
              <div className="validation-itemRGS">
                <ValidationIcon isValid={passwordValidation.length} />
                <span
                  className={
                    passwordValidation.length ? "valid-textRGS" : "invalid-textRGS"
                  }
                >
                  Mínimo 8 caracteres
                </span>
              </div>
              <div className="validation-itemRGS">
                <ValidationIcon isValid={passwordValidation.uppercase} />
                <span
                  className={
                    passwordValidation.uppercase ? "valid-textRGS" : "invalid-textRGS"
                  }
                >
                  Al menos una mayúscula
                </span>
              </div>
              <div className="validation-itemRGS">
                <ValidationIcon isValid={passwordValidation.number} />
                <span
                  className={
                    passwordValidation.number ? "valid-textRGS" : "invalid-textRGS"
                  }
                >
                  Al menos un número
                </span>
              </div>
              <div className="validation-itemRGS">
                <ValidationIcon isValid={passwordValidation.special} />
                <span
                  className={
                    passwordValidation.special ? "valid-textRGS" : "invalid-textRGS"
                  }
                >
                  Al menos un carácter especial (!@#$%^&*)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirmar contraseña */}
        <div className="form-groupRGS">
          <label htmlFor="confirmPassword" className="form-labelRGS">
            Confirme su contraseña
          </label>
          <div className="password-containerRGS">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-inputRGS"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="password-toggleRGS"
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {formData.confirmPassword &&
            formData.password !== formData.confirmPassword && (
              <div className="validation-itemRGS">
                <X className="validation-iconRGS invalid" size={16} />
                <span className="invalid-textRGS">
                  Las contraseñas no coinciden
                </span>
              </div>
            )}
        </div>

        {/* Checkbox entrenador */}
        <div className="checkbox-containerRGS">
          <input
  type="checkbox"
  id="isTrainer"
  className="checkbox-large"
  checked={formData.isTrainer}
  onChange={handleCheckboxChange}
/>
          <label htmlFor="isTrainer" className="checkbox-labelRGS">
            Deseo registrarme como Entrenador
          </label>
        </div>

        {/* Botón submit */}
        <div className="submit-containerRegistroRGS">
          <button
            type="submit"
            className="submit-buttonRegistroRGS"
            disabled={isLoading || !isPasswordValid(passwordValidation)}
          >
            {isLoading ? "Registrando..." : "Registrarme"}
          </button>
        </div>
      </form>
    </div>
  )
}
