const mongoose = require('mongoose');

/* ─── Listas canónicas ─── */
const CATEGORIAS  = ['Yoga', 'Funcional', 'Running', 'Gimnasio', 'Nutricion'];
const ZONAS       = ['Palermo', 'Belgrano', 'Caballito', 'Villa Crespo', 'Recoleta'];
const MODALIDADES = ['Presencial', 'Virtual', 'Híbrido'];
const IDIOMAS     = ['Español', 'Inglés', 'Portugués'];

const ServicioSchema = new mongoose.Schema(
  {
    categoria : { type: String, enum: CATEGORIAS,  required: true },
    zona      : { type: String, enum: ZONAS,       required: true },
    modalidad : { type: String, enum: MODALIDADES, required: true },
    idioma    : { type: String, enum: IDIOMAS,     required: true },

    /* Queda como texto libre, máx 30 caracteres */
    diasDisponibles: { type: String, required: true },

    duracion      : { type: Number, min: 0, max: 480,  required: true }, // minutos
    rangoHorario  : {
      type   : String,
      match  : [/^([01]\d|2[0-3]):[0-5]\d\s?-\s?([01]\d|2[0-3]):[0-5]\d$/, "Formato 'HH:MM - HH:MM'"],
      required: true,
    },
    precio        : { type: Number, min: 0, max: 30000, required: true },
    descripcion   : { type: String, minlength: 20, maxlength: 2000, required: true },
    imagenServicio: { type: String },          // ruta al archivo
    publicado     : { type: Boolean, default: false },
    entrenador    : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

/* Exportamos tanto el modelo como las listas → el front puede consumirlas */
module.exports = {
  Servicio      : mongoose.model('Servicio', ServicioSchema),
  CATEGORIAS,
  ZONAS,
  MODALIDADES,
  IDIOMAS,
};
