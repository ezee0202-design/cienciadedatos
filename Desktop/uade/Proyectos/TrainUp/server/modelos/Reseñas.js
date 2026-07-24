const mongoose = require('mongoose');

const ResenaSchema = new mongoose.Schema({
  cliente:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },     // cliente que hizo la reseña
  servicio:       { type: mongoose.Schema.Types.ObjectId, ref: 'Servicio', required: true },
   reserva:      { type: mongoose.Schema.Types.ObjectId, ref: 'Reserva', required: true },
  entrenador:{ type: mongoose.Schema.Types.ObjectId, ref: 'User',      required: true }, // servicio reseñado
  calificacion:   { type: Number, required: true, min: 1, max: 5 },                           // calificación (1 a 5)
  comentario:     { type: String },                                                           // comentario opcional
  respuesta:      { type: String },                                                           // respuesta del entrenador
  fecha:          { type: Date, default: Date.now }                                           // fecha de la reseña
}, { timestamps: true });

module.exports = mongoose.model('Resena', ResenaSchema);
