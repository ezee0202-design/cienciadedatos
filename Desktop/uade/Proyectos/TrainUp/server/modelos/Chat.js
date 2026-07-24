const mongoose = require("mongoose")

const MensajeSchema = new mongoose.Schema({
  remitente: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  contenido: { type: String },
  tipoArchivo: { type: String }, // 'imagen', 'pdf', 'documento', etc.
  archivoUrl: { type: String }, // URL del archivo subido
  nombreArchivo: { type: String },
  fechaEnvio: { type: Date, default: Date.now },
  leido: { type: Boolean, default: false },
})

const ConversacionSchema = new mongoose.Schema(
  {
    participantes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    ultimoMensaje: { type: mongoose.Schema.Types.ObjectId, ref: "Mensaje" },
    fechaUltimaActividad: { type: Date, default: Date.now },
    mensajes: [MensajeSchema],
  },
  { timestamps: true },
)

const Mensaje = mongoose.model("Mensaje", MensajeSchema)
const Conversacion = mongoose.model("Conversacion", ConversacionSchema)

module.exports = { Conversacion, Mensaje }
