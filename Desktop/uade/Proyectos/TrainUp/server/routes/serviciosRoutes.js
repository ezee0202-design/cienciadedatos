const express = require('express');
const router = express.Router();
const Reserva = require('../modelos/Reservas');
const { Servicio, CATEGORIAS, ZONAS, MODALIDADES, IDIOMAS } = require('../modelos/Servicio');
const duracionOptions = Servicio.schema.path('duracion').options;
const precioOptions = Servicio.schema.path('precio').options;
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const authMiddleware = require('../middlewares/authMiddleware'); // para verificar el token y obtener el user
const multer  = require('multer');
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

//ruta para las opciones del filtro/formularios de servicio
router.get('/opciones', (_req, res) => {
  res.json({
    categorias : CATEGORIAS,
    zonas      : ZONAS,
    modalidades: MODALIDADES,
    idiomas    : IDIOMAS,
    duracion   : { min: duracionOptions.min, max: duracionOptions.max },
    precio     : { min: precioOptions.min, max: precioOptions.max },
  });
});

// POST /api/servicios  (único cambio: upload.single('imagen'))
router.post('/', authMiddleware, upload.single('imagen'), async (req, res) => {
  try {
    const entrenadorId = req.userId;
    const imagenServicio = req.file ? `/uploads/${req.file.filename}` : undefined;

    const nuevoServicio = new Servicio({
      ...req.body,
      imagenServicio,
      entrenador: entrenadorId
    });

    const guardado = await nuevoServicio.save();
    res.status(201).json(guardado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el servicio' });
  }
});

/// Ruta para obtener todos los servicios con filtros (GET)
router.get('/', async (req, res) => {
  try {
    const query = {};

    query.publicado = true;

    // Filtros opcionales
    if (req.query.categoria && req.query.categoria !== 'Todas las categorías') {
      query.categoria = req.query.categoria;
    }

    if (req.query.zona && req.query.zona !== 'Seleccione una zona') {
      query.zona = req.query.zona;
    }

    if (req.query.modalidad && req.query.modalidad !== 'Seleccione la modalidad') {
      query.modalidad = req.query.modalidad;
    }

    if (req.query.idioma && req.query.idioma !== 'Seleccione el idioma') {
      query.idioma = req.query.idioma;
    }

    if (req.query.precio) {
      query.precio = { $lte: parseFloat(req.query.precio) };
    }

    if (req.query.duracion) {
      query.duracion = { $lte: parseInt(req.query.duracion) };
    }

    const servicios = await Servicio.find(query)
      .populate('entrenador', 'nombreCompleto')
      .exec();

    res.json(servicios);
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ error: 'Error al obtener servicios', details: error.message });
  }
});


// Ruta para obtener los servicios "mios" (del entrenador autenticado)
router.get('/mios', authMiddleware, async (req, res) => {
  try {
    const servicios = await Servicio.find({ entrenador: req.userId });
    res.json(servicios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener servicios' });
  }
});

// para obtener los servicios en la busqueda por nombre
router.get('/entrenador/:entrenadorId', async (req, res) => {
  try {
    const servicios = await Servicio.find({ 
      entrenador: req.params.entrenadorId,
      publicado: true
    })
    .populate('entrenador', 'nombreCompleto');
    
    res.json(servicios);
  } catch (error) {
    console.error('Error al obtener servicios por entrenador:', error);
    res.status(500).json({ mensaje: 'Error al obtener servicios por entrenador', details: error.message });
  }
});

// Ruta para obtener un servicio por ID (GET /:id)
router.get('/:id', async (req, res) => {
  try {
    const servicio = await Servicio.findById(req.params.id)
      .populate('entrenador', 'nombreCompleto');

    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.json(servicio);
  } catch (error) {
    console.error('Error al obtener el servicio por ID:', error);
    res.status(500).json({ error: 'Error al obtener el servicio', details: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const servicio = await Servicio.findById(id);
    if (!servicio) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    // 1. Verificar si hay alguna reserva confirmada (bloquea eliminación)
    const reservasConfirmadas = await Reserva.find({
      servicioId: id,
      estado: 'confirmada'
    });

    if (reservasConfirmadas.length > 0) {
      return res.status(400).json({
        message: 'No se puede eliminar el servicio porque hay reservas aceptadas en curso.'
      });
    }

    // 2. Procesar únicamente las reservas pendientes
    const reservasPendientes = await Reserva.find({
      servicioId: id,
      estado: 'pendiente'
    });

    for (const reserva of reservasPendientes) {
      const intentId = reserva.pago?.tokenPago;

      if (intentId) {
        try {
          const intent = await stripe.paymentIntents.retrieve(intentId);

          if (
            ['requires_confirmation', 'requires_capture', 'processing', 'requires_payment_method'].includes(intent.status)
          ) {
            const cancelado = await stripe.paymentIntents.cancel(intentId);
            reserva.pago.estadoStripe = cancelado.status;
            reserva.pago.canceladoEn = new Date();
          }

        } catch (error) {
          console.error(`Error procesando PaymentIntent ${intentId}:`, error);
        }
      }

      // Marcar como cancelada (no finalizada)
      reserva.estado = 'cancelada';
      await reserva.save();
    }

    // 3. Eliminar el servicio
    await servicio.deleteOne();

    res.json({ message: 'Servicio eliminado correctamente. Reservas pendientes canceladas.' });

  } catch (error) {
    console.error('Error eliminando servicio:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


// Ruta para actualizar el estado publicado/despublicado
router.patch('/:id/publicar', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { publicado } = req.body;

  try {
    const servicio = await Servicio.findById(id);
    if (!servicio) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    // Verificar que el usuario sea el dueño del servicio
    if (servicio.entrenador.toString() !== req.userId) {
      return res.status(403).json({ message: 'No autorizado para modificar este servicio' });
    }

    servicio.publicado = publicado;
    await servicio.save();

    res.json({ message: 'Estado de publicación actualizado', publicado: servicio.publicado });
  } catch (error) {
    console.error('Error al actualizar estado publicado:', error);
    res.status(500).json({ message: 'Error al actualizar el estado de publicación' });
  }
});

router.patch('/:id', authMiddleware, upload.single('imagen'), async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await Servicio.findById(id);

    if (!servicio) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    if (servicio.entrenador.toString() !== req.userId) {
      return res.status(403).json({ message: 'No autorizado para modificar este servicio' });
    }

    // ❗ No permitir si hay reservas confirmadas
    const reservasConfirmadas = await Reserva.find({
      servicioId: id,
      estado: 'confirmada'
    });

    if (reservasConfirmadas.length > 0) {
      return res.status(400).json({
        message: 'No se puede actualizar el servicio porque hay reservas aceptadas en curso.'
      });
    }

    if (req.file) {
      servicio.imagenServicio = `/uploads/${req.file.filename}`;
    }

    const camposActualizar = [
      'categoria',
      'duracion',
      'diasDisponibles',
      'rangoHorario',
      'idioma',
      'zona',
      'modalidad',
      'precio',
      'descripcion'
    ];

    camposActualizar.forEach(campo => {
      if (req.body[campo] !== undefined) {
        servicio[campo] = req.body[campo];
      }
    });

    await servicio.save();

    // Cancelar reservas pendientes asociadas
    const reservasPendientes = await Reserva.find({ servicioId: id, estado: 'pendiente' });

    for (const reserva of reservasPendientes) {
      const intentId = reserva.pago?.tokenPago;

      if (intentId) {
        try {
          const intent = await stripe.paymentIntents.retrieve(intentId);

          if (['requires_confirmation', 'requires_capture', 'processing', 'requires_payment_method'].includes(intent.status)) {
            const cancelado = await stripe.paymentIntents.cancel(intentId);
            reserva.pago.estadoStripe = cancelado.status;
            reserva.pago.canceladoEn = new Date();
          }
        } catch (error) {
          console.error(`Error procesando PaymentIntent ${intentId}:`, error);
        }
      }

      reserva.estado = 'cancelada';
      await reserva.save();
    }

    res.json({ message: 'Servicio actualizado correctamente y reservas pendientes canceladas', servicio });

  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    res.status(500).json({ message: 'Error al actualizar el servicio', error: error.message });
  }
});


module.exports = router;
