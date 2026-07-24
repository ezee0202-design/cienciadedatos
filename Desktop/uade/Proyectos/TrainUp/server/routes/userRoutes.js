const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const User = require("../modelos/User")
const { Servicio } = require("../modelos/Servicio")
const Resena = require("../modelos/Reseñas")
const authMiddleware = require("../middlewares/authMiddleware")
const { sendPasswordResetEmail } = require("../config/emailConfig")
const multer = require("multer")

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage })

const router = express.Router()

// Función para validar contraseña
const validatePassword = (password) => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  return {
    isValid: password.length >= minLength && hasUpperCase && hasNumber && hasSpecialChar,
    errors: [
      ...(password.length < minLength ? ["La contraseña debe tener al menos 8 caracteres"] : []),
      ...(!hasUpperCase ? ["La contraseña debe tener al menos una mayúscula"] : []),
      ...(!hasNumber ? ["La contraseña debe tener al menos un número"] : []),
      ...(!hasSpecialChar ? ["La contraseña debe tener al menos un carácter especial"] : []),
    ],
  }
}

// Función para generar JWT
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role: role }, process.env.JWT_SECRET || "secreto_super_seguro", { expiresIn: "24h" })
}

// Registro
router.post("/registro", async (req, res) => {
  const { email, contraseña, nombreCompleto, FechaNacimiento, role } = req.body

  try {
    const usuarioExistente = await User.findOne({ email })
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: "El email ya está registrado" })
    }

    const passwordValidation = validatePassword(contraseña)
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        mensaje: "La contraseña no cumple con los requisitos de seguridad",
        errores: passwordValidation.errors,
      })
    }

    const salt = await bcrypt.genSalt(12)
    const contraseñaHasheada = await bcrypt.hash(contraseña, salt)

    const nuevoUsuario = new User({
      email,
      contraseña: contraseñaHasheada,
      nombreCompleto,
      FechaNacimiento,
      role,
    })

    await nuevoUsuario.save()
    console.log("Usuario guardado:", nuevoUsuario)

    const token = generateToken(nuevoUsuario._id, nuevoUsuario.role)

    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      token,
      usuario: {
        id: nuevoUsuario._id,
        email: nuevoUsuario.email,
        nombreCompleto: nuevoUsuario.nombreCompleto,
        role: nuevoUsuario.role,
        fotoPerfilUrl: nuevoUsuario.fotoPerfilUrl,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ mensaje: "Error al registrar el usuario" })
  }
})

// Login
router.post("/login", async (req, res) => {
  const { email, contraseña } = req.body

  try {
    const usuario = await User.findOne({ email })
    if (!usuario) return res.status(400).json({ mensaje: "Credenciales inválidas" })

    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña)
    if (!contraseñaValida) return res.status(400).json({ mensaje: "Credenciales inválidas" })

    const token = generateToken(usuario._id, usuario.role)

    res.json({
      mensaje: "Login exitoso",
      token,
      usuario: {
        id: usuario._id,
        email: usuario.email,
        nombreCompleto: usuario.nombreCompleto,
        role: usuario.role,
        fotoPerfilUrl: usuario.fotoPerfilUrl,
      },
    })
  } catch (err) {
    res.status(500).json({ mensaje: "Error en el login" })
  }
})

// Recuperación de contraseña (MEJORADA)
router.post("/recuperar-password", async (req, res) => {
  const { email } = req.body
  console.log(`Solicitud de recuperación para: ${email}`)

  try {
    if (!email || !email.trim()) {
      return res.status(400).json({ mensaje: "El email es requerido" })
    }

    const usuario = await User.findOne({ email: email.trim() })
    console.log(`Usuario encontrado: ${usuario ? "Sí" : "No"}`)

    if (!usuario) {
      return res.json({ mensaje: "Si el email existe, recibirás un enlace de recuperación", success: true })
    }

    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = Date.now() + 3600000

    usuario.resetPasswordToken = resetToken
    usuario.resetPasswordExpires = resetTokenExpiry
    await usuario.save()

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/restablecer-password/${resetToken}`

    try {
      const emailResult = await sendPasswordResetEmail(email, resetToken, resetUrl)

      res.json({
        mensaje: "Si el email existe, recibirás un enlace de recuperación",
        success: true,
        ...(process.env.NODE_ENV === "development" && {
          previewUrl: emailResult.previewUrl,
          resetUrl: resetUrl,
        }),
      })
    } catch (emailError) {
      console.error("Error enviando email:", emailError)
      usuario.resetPasswordToken = undefined
      usuario.resetPasswordExpires = undefined
      await usuario.save()

      res.status(500).json({ mensaje: "Error enviando el email de recuperación" })
    }
  } catch (err) {
    console.error("Error general en recuperar-password:", err)
    res.status(500).json({ mensaje: "Error al procesar la solicitud" })
  }
})

// Restablecer contraseña por TOKEN en el BODY (versión original)
router.post("/restablecer-password", async (req, res) => {
  const { token, nuevaContraseña } = req.body

  try {
    const passwordValidation = validatePassword(nuevaContraseña)
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        mensaje: "La nueva contraseña no cumple con los requisitos de seguridad",
        errores: passwordValidation.errors,
      })
    }

    const usuario = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!usuario) {
      return res.status(400).json({ mensaje: "Token inválido o expirado" })
    }

    const salt = await bcrypt.genSalt(12)
    usuario.contraseña = await bcrypt.hash(nuevaContraseña, salt)
    usuario.resetPasswordToken = undefined
    usuario.resetPasswordExpires = undefined
    await usuario.save()

    res.json({ mensaje: "Contraseña restablecida correctamente" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ mensaje: "Error al restablecer la contraseña" })
  }
})

// NUEVA versión: Restablecer contraseña por TOKEN en la URL
router.post("/restablecer-password/:token", async (req, res) => {
  const { token } = req.params
  const { nuevaContraseña } = req.body

  try {
    const passwordValidation = validatePassword(nuevaContraseña)
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        mensaje: "La nueva contraseña no cumple con los requisitos de seguridad",
        errores: passwordValidation.errors,
      })
    }

    const usuario = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!usuario) {
      return res.status(400).json({ mensaje: "Token inválido o expirado" })
    }

    const salt = await bcrypt.genSalt(12)
    usuario.contraseña = await bcrypt.hash(nuevaContraseña, salt)
    usuario.resetPasswordToken = undefined
    usuario.resetPasswordExpires = undefined
    await usuario.save()

    res.json({ mensaje: "Contraseña restablecida correctamente" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ mensaje: "Error al restablecer la contraseña" })
  }
})

// Obtener perfil del usuario autenticado
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-contraseña")
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: "Error al obtener perfil" })
  }
})

// Buscar entrenadores por nombre
router.get("/buscar-entrenadores", async (req, res) => {
  const { nombre } = req.query

  try {
    const entrenadores = await User.find({
      role: "entrenador",
      nombreCompleto: { $regex: nombre, $options: "i" },
    }).select("nombreCompleto fotoPerfilUrl")

    res.json(entrenadores)
  } catch (error) {
    res.status(500).json({ message: "Error al buscar entrenadores" })
  }
})

router.get("/entrenadores/:id", async (req, res) => {
  const { id } = req.params

  try {
    const entrenador = await User.findOne({ _id: id, role: "entrenador" }).select(
      "nombreCompleto email FechaNacimiento certificaciones descripcion fotoPerfilUrl",
    )

    if (!entrenador) {
      return res.status(404).json({ message: "Entrenador no encontrado" })
    }

    res.json(entrenador)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error al obtener entrenador" })
  }
})

router.put("/me", authMiddleware, upload.single("foto"), async (req, res) => {
  try {
    const userId = req.userId
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" })

    const userRole = user.role
    let allowedFields = []
    const updateData = {}

    if (userRole === "cliente") {
      allowedFields = ["nombreCompleto", "numeroCelular", "alturaCm", "pesoKg"]
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field] === "" ? null : req.body[field]
        }
      })
    } else if (userRole === "entrenador") {
      allowedFields = ["nombreCompleto", "certificaciones", "descripcion"]
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field]
        }
      })

      if (updateData.certificaciones) {
        try {
          updateData.certificaciones = JSON.parse(updateData.certificaciones)
        } catch (e) {
          return res.status(400).json({ message: "Certificaciones mal formateadas" })
        }
      }
    }

    if (req.file) {
      updateData.fotoPerfilUrl = `/uploads/${req.file.filename}`
    }

    if (Object.keys(updateData).length === 0 && !req.file) {
      return res.status(400).json({ message: "No se enviaron campos para actualizar" })
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true }).select("-contraseña")

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado al actualizar" })
    }

    res.json(updatedUser)
  } catch (err) {
    console.error(err)
    res.status(500).send("Error del servidor")
  }
})

module.exports = router
