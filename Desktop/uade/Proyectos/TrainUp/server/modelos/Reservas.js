const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReservaSchema = new Schema({
  servicioId: { type: Schema.Types.ObjectId, ref: 'Servicio', required: true },  // el servicio contratado (ej: Running)
  clienteId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  entrenadorId    : { type: Schema.Types.ObjectId, ref: "User", required: true },      // quien hace la reserva
  fechaPreferida: { type: Date, required: true },                              // fecha preferida para la sesión
  duracionMinutos: { type: Number, required: true, default: 60 },              // duración de la sesión
  zona: { type: String, required: true },                                      
  precioTotal: { type: Number, required: true },
  horarioDeseado: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/,}, // formato HH:mm
  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'cancelada', 'finalizada'],
    default: 'pendiente'
  },
  pago: {
    nombreTarjeta: { type: String, required: true },       // nombre en la tarjeta
    // Nota: NO almacenar datos sensibles como número completo, CVV o fecha de vencimiento en texto plano por seguridad.
    tokenPago: { type: String, required: true },           // ejemplo token o id transacción pago
    fechaVencimiento: { type: String, required: true } 
  },
  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reserva', ReservaSchema);
