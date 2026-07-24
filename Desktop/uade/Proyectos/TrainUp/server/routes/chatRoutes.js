const express = require("express")
const router = express.Router()
const authMiddleware = require("../middlewares/authMiddleware")
const { Conversacion, Mensaje } = require("../modelos/Chat")
const User = require("../modelos/User")
const multer = require("multer")
const path = require("path")

// Configuración de multer para archivos del chat
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/chat/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, "archivo-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    // Permitir imágenes, PDFs y documentos
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Tipo de archivo no permitido"))
    }
  },
})

// Buscar usuario por email
router.get("/buscar-usuario/:email", authMiddleware, async (req, res) => {
  try {
    const { email } = req.params
    const usuario = await User.findOne({ email }).select("_id nombreCompleto email fotoPerfilUrl")

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" })
    }

    res.json(usuario)
  } catch (error) {
    console.error("Error al buscar usuario:", error)
    res.status(500).json({ error: "Error al buscar usuario" })
  }
})

// Obtener todas las conversaciones del usuario autenticado
router.get("/conversaciones", authMiddleware, async (req, res) => {
  try {
    const conversaciones = await Conversacion.find({
      participantes: req.userId,
    })
      .populate("participantes", "nombreCompleto fotoPerfilUrl")
      .sort({ fechaUltimaActividad: -1 })

    const conversacionesFormateadas = conversaciones.map((conv) => {
      const otroParticipante = conv.participantes.find((p) => p._id.toString() !== req.userId)

      // Get the last message from the messages array
      const ultimoMensaje = conv.mensajes && conv.mensajes.length > 0 ? conv.mensajes[conv.mensajes.length - 1] : null

      return {
        id: conv._id,
        participante: {
          id: otroParticipante._id,
          nombre: otroParticipante.nombreCompleto,
          avatar: otroParticipante.fotoPerfilUrl,
        },
        ultimoMensaje: ultimoMensaje
          ? {
              contenido: ultimoMensaje.contenido || "Archivo adjunto",
              fecha: ultimoMensaje.fechaEnvio,
            }
          : null,
        fechaUltimaActividad: conv.fechaUltimaActividad,
      }
    })

    res.json(conversacionesFormateadas)
  } catch (error) {
    console.error("Error al obtener conversaciones:", error)
    res.status(500).json({ error: "Error al obtener conversaciones" })
  }
})

// Obtener conversación específica con un participante
router.get("/conversacion/:participanteId", authMiddleware, async (req, res) => {
  try {
    const { participanteId } = req.params
    const userId = req.userId

    // Buscar conversación existente entre los dos usuarios
    let conversacion = await Conversacion.findOne({
      participantes: { $all: [userId, participanteId] },
    }).populate("participantes", "nombreCompleto fotoPerfilUrl")

    // Si no existe, crear una nueva conversación
    if (!conversacion) {
      conversacion = new Conversacion({
        participantes: [userId, participanteId],
        mensajes: [],
        fechaUltimaActividad: new Date(),
      })
      await conversacion.save()
      await conversacion.populate("participantes", "nombreCompleto fotoPerfilUrl")
    }

    // Formatear mensajes
    const mensajesFormateados = conversacion.mensajes.map((mensaje) => ({
      id: mensaje._id,
      contenido: mensaje.contenido,
      esPropio: mensaje.remitente.toString() === userId,
      timestamp: mensaje.fechaEnvio,
      tipoArchivo: mensaje.tipoArchivo,
      archivoUrl: mensaje.archivoUrl,
      nombreArchivo: mensaje.nombreArchivo,
    }))

    res.json({
      id: conversacion._id,
      participantes: conversacion.participantes,
      mensajes: mensajesFormateados,
    })
  } catch (error) {
    console.error("Error al obtener conversación:", error)
    res.status(500).json({ error: "Error al obtener la conversación" })
  }
})

// Enviar mensaje de texto
router.post("/enviar-mensaje", authMiddleware, async (req, res) => {
  try {
    const { participanteId, contenido } = req.body
    const userId = req.userId

    if (!participanteId || !contenido) {
      return res.status(400).json({ error: "Faltan datos requeridos" })
    }

    // Buscar o crear conversación
    let conversacion = await Conversacion.findOne({
      participantes: { $all: [userId, participanteId] },
    })

    if (!conversacion) {
      conversacion = new Conversacion({
        participantes: [userId, participanteId],
        mensajes: [],
        fechaUltimaActividad: new Date(),
      })
    }

    // Crear nuevo mensaje
    const nuevoMensaje = {
      remitente: userId,
      contenido,
      fechaEnvio: new Date(),
      leido: false,
    }

    // Agregar mensaje a la conversación
    conversacion.mensajes.push(nuevoMensaje)
    conversacion.fechaUltimaActividad = new Date()

    await conversacion.save()

    res.status(201).json({
      mensaje: "Mensaje enviado exitosamente",
      conversacion: conversacion._id,
    })
  } catch (error) {
    console.error("Error al enviar mensaje:", error)
    res.status(500).json({ error: "Error al enviar el mensaje" })
  }
})

// Enviar archivo
router.post("/enviar-archivo", authMiddleware, upload.single("archivo"), async (req, res) => {
  try {
    const { participanteId } = req.body
    const userId = req.userId

    if (!participanteId || !req.file) {
      return res.status(400).json({ error: "Faltan datos requeridos" })
    }

    // Buscar o crear conversación
    let conversacion = await Conversacion.findOne({
      participantes: { $all: [userId, participanteId] },
    })

    if (!conversacion) {
      conversacion = new Conversacion({
        participantes: [userId, participanteId],
        mensajes: [],
        fechaUltimaActividad: new Date(),
      })
    }

    // Determinar tipo de archivo
    const extension = path.extname(req.file.originalname).toLowerCase()
    let tipoArchivo = "documento"
    if ([".jpg", ".jpeg", ".png", ".gif"].includes(extension)) {
      tipoArchivo = "imagen"
    } else if (extension === ".pdf") {
      tipoArchivo = "pdf"
    }

    // Crear nuevo mensaje con archivo
    const nuevoMensaje = {
      remitente: userId,
      contenido: `Archivo: ${req.file.originalname}`,
      tipoArchivo,
      archivoUrl: `/uploads/chat/${req.file.filename}`,
      nombreArchivo: req.file.originalname,
      fechaEnvio: new Date(),
      leido: false,
    }

    // Agregar mensaje a la conversación
    conversacion.mensajes.push(nuevoMensaje)
    conversacion.fechaUltimaActividad = new Date()

    await conversacion.save()

    res.status(201).json({
      mensaje: "Archivo enviado exitosamente",
      conversacion: conversacion._id,
      archivo: {
        nombre: req.file.originalname,
        url: `/uploads/chat/${req.file.filename}`,
        tipo: tipoArchivo,
      },
    })
  } catch (error) {
    console.error("Error al enviar archivo:", error)
    res.status(500).json({ error: "Error al enviar el archivo" })
  }
})

module.exports = router
