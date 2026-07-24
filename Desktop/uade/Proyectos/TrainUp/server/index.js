require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")

const app = express()

// CORS 
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
)

// Middleware para parsear JSON
app.use(express.json())

// Servir archivos estáticos (para el chat)
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body)
  next()
})

// Ruta de prueba para verificar que el servidor funciona
app.get("/", (req, res) => {
  res.json({
    mensaje: "Servidor funcionando correctamente",
    timestamp: new Date().toISOString(),
    endpoints: [
      "GET /api/usuarios/buscar-entrenadores",
      "POST /api/usuarios/registro",
      "POST /api/usuarios/login",
      "GET /api/servicios",
      "POST /api/reservas",
    ],
  })
})

// Conexión a MongoDB
mongoose
  .connect("mongodb://localhost:27017/grupo15_api")
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Error de conexión a MongoDB", err))

// Rutas
const userRoutes = require("./routes/userRoutes")
app.use("/api/usuarios", userRoutes)

// Ruta Servicio
const serviciosRouter = require("./routes/serviciosRoutes")
app.use("/api/servicios", serviciosRouter)

// Ruta Reservas
const reservasRouter = require("./routes/reservasRoutes")
app.use("/api/reservas", reservasRouter)

// Ruta de reseñas
const resenasRoute = require("./routes/reseñasRoutes")
app.use("/api/resenas", resenasRoute)

// Usar las rutas 
const interaccionesRoutes = require("./routes/interaccionesRoutes")
app.use("/api/interacciones", interaccionesRoutes)

// Ruta de chat
const chatRoutes = require("./routes/chatRoutes")
app.use("/api/chat", chatRoutes)

// Iniciar servidor
const PORT = process.env.PORT || 5000 // ← CAMBIADO: De vuelta al puerto 5000
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
  console.log(`Prueba el servidor en: http://localhost:${PORT}`)
  console.log(`Registro de usuarios: http://localhost:${PORT}/api/usuarios/registro`)
})

// Manejo de errores no capturados
process.on("uncaughtException", (err) => {
  console.error("Error no capturado:", err)
})

process.on("unhandledRejection", (err) => {
  console.error("Promesa rechazada no manejada:", err)
})
