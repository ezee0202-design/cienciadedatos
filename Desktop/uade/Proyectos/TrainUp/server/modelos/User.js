
const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true },
    nombreCompleto: { type: String, required: true },
    FechaNacimiento: { type: Date, required: true },
    role: { type: String, enum: ["cliente", "entrenador"], required: true },

    // Recuperación de contraseña
    resetPasswordToken: { type: String, default: undefined },
    resetPasswordExpires: { type: Date, default: undefined },

    // Entrenador
    certificaciones: [{ type: String }],
    descripcion: { type: String },
    fotoPerfilUrl: { type: String },

    // Cliente
    numeroCelular: { type: String },
    alturaCm: { type: Number },
    pesoKg: { type: Number },
  },
  { timestamps: true }, // createdAt y updatedAt
)

module.exports = mongoose.model("User", UserSchema)
