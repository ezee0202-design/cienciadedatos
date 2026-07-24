import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // iconos
import "./loginSesion.css";

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, contraseña: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMensaje(data.mensaje || "Error al iniciar sesión");
        return;
      }

      const { token, usuario } = data;
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));
      window.dispatchEvent(new Event("loginExitoso"));

      if (usuario.role === "entrenador") navigate("/entrenador/perfil");
      else if (usuario.role === "cliente") navigate("/cliente/perfil");
      else navigate("/");
    } catch (err) {
      console.error("Error:", err);
      setMensaje("Error en la conexión con el servidor");
    }
  };

  return (
    <div className="login-screen-containerLGN">
      <div className="login-cardLGN">
        <h1 className="login-titleLGN">Iniciar sesión</h1>
        <p className="login-subtitleLGN">
          Ingrese sus credenciales para acceder a su cuenta
        </p>

        <form onSubmit={handleSubmit} className="login-formLGN">
          {/* Email */}
          <label htmlFor="email-input" className="form-labelLGN">
            Ingrese su Email
          </label>
          <input
            type="email"
            id="email-input"
            className="form-inputLGN"
            placeholder="usuario@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Contraseña con toggle */}
          <label htmlFor="password-input" className="form-labelLGN">
            Ingrese su Contraseña
          </label>
          <div className="password-containerLGN">
            <input
              type={showPassword ? "text" : "password"}
              id="password-input"
              className="form-inputLGN"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggleLGN"
              aria-label="Mostrar/Ocultar contraseña"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Recordarme */}
          <div className="form-checkbox-rowLGN">
            <input
              type="checkbox"
              id="remember-me"
              className="checkbox-inputLGN"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me" className="checkbox-labelLGN">
              Recordarme
            </label>
          </div>

          <button type="submit" className="login-buttonLGN">
            Ingresar
          </button>

          <Link to="/olvide-contraseña" className="forgot-password-linkLGN">
            ¿Olvidaste tu contraseña?
          </Link>

          {mensaje && <p className="login-messageLGN">{mensaje}</p>}
        </form>
      </div>
    </div>
  );
}

export default LoginScreen;
