const mongoose = require('mongoose');

const interaccionServicioSchema = new mongoose.Schema({
  servicio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Servicio",
    required: true
  },
  entrenador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true
  },
  tipo: {
    type: String,
    enum: ["visualizacion", "compra"],
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("InteraccionServicio", interaccionServicioSchema);
