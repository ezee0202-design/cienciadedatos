// routes/reservas.js

const express = require('express');
const router = express.Router();
const Reserva = require('../modelos/Reservas');
const {Servicio} = require('../modelos/Servicio');
const Resena = require('../modelos/Reseñas');
const authMiddleware = require('../middlewares/authMiddleware'); 
const Stripe = require('stripe');
require('dotenv').config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
console.log("Stripe key:", process.env.STRIPE_SECRET_KEY);

router.post('/', async (req, res) => {
  try {
    const {
      servicioId,
      entrenadorId,
      clienteId,
      fechaPreferida,
      duracionMinutos,
      zona,
      precioTotal,
      horarioDeseado,
      nombreTarjeta,      // opcional, sólo lo guardo como referencia
      fechaVencimiento    // idem
    } = req.body;

    // Validaciones mínimas (el token lo genera Stripe)
    if (!servicioId || !entrenadorId || !clienteId || !fechaPreferida || !precioTotal) {
      return res.status(400).json({ error: 'Faltan datos requeridos para crear la reserva.' });
    }

    /* 
       Crear el PaymentIntent en modo "manual", Queda en status: requires_confirmation*/
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(precioTotal * 100), // 500 → 50000 centavos
      currency: 'ars',
      payment_method: 'pm_card_ar',          // test card AR
      payment_method_types: ['card'],
      confirmation_method: 'manual',         // se confirma luego
    });

    /*Guarda la reserva aun cuando el intent NO está “succeeded”.
          El intent válido es el que se creó sin lanzar error. */
    const reserva = new Reserva({
      servicioId,
      entrenadorId,
      clienteId,
      fechaPreferida,
      duracionMinutos,
      zona,
      precioTotal,
      horarioDeseado,
      pago: {
        nombreTarjeta,
        fechaVencimiento,
        tokenPago: paymentIntent.id,      // lo confirmaremos al aceptar
        estadoStripe: paymentIntent.status
      },
      estado: 'pendiente'
    });

    await reserva.save();

    /*Responde con la reserva y (opcional) el client_secret
          por si se quiere confirmar desde el cliente */
    res.status(201).json({
      message: 'Reserva creada. Pago pendiente de confirmación.',
      reserva,
      clientSecret: paymentIntent.client_secret   // opcional
    });

  } catch (err) {
    console.error('Error al crear la reserva:', err);
    if (err.type === 'StripeCardError') {
      return res.status(402).json({ error: err.message });
    }
    res.status(500).json({ error: err.message || 'Error al procesar la reserva.' });
  }
});



router.get('/entrenador/:entrenadorId', async (req, res) => {
  try {
    const { entrenadorId } = req.params;

    const reservas = await Reserva.find({ entrenadorId })
      .populate({ path: 'servicioId', select: 'nombre' })
      .populate({ path: 'clienteId', select: 'nombreCompleto' });

    const ahora = new Date();
    const dentroDeUnDia = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

    for (const reserva of reservas) {
      const [h, m] = reserva.horarioDeseado.split(':').map(Number);
      const [anio, mes, dia] = reserva.fechaPreferida.toISOString().slice(0, 10).split('-').map(Number);
      const fechaHoraReserva = new Date(anio, mes - 1, dia, h, m, 0);
      const intentId = reserva.pago?.tokenPago;

      // 1. Pendiente → procesar 1 día antes
      if (reserva.estado === 'pendiente' && fechaHoraReserva <= dentroDeUnDia) {
        if (intentId) {
          try {
            const intent = await stripe.paymentIntents.retrieve(intentId);
            if (['requires_confirmation', 'requires_capture', 'processing'].includes(intent.status)) {
              const cancelado = await stripe.paymentIntents.cancel(intentId);
              reserva.pago.estadoStripe = cancelado.status;
              reserva.pago.canceladoEn = new Date();
            }
          } catch (e) {
            console.error(`Stripe error con PaymentIntent ${intentId}:`, e);
          }
        }

        reserva.estado = 'cancelada';
        await reserva.save();
      }

      // 2. Confirmada → procesar solo si ya pasó
      if (reserva.estado === 'confirmada' && fechaHoraReserva <= ahora) {
        reserva.estado = 'finalizada';
        await reserva.save();
      }

      // 3. Cancelada → procesar 1 día antes (solo Stripe)
      if (reserva.estado === 'cancelada' && fechaHoraReserva <= dentroDeUnDia) {
        if (intentId) {
          try {
            const intent = await stripe.paymentIntents.retrieve(intentId);
            if (['requires_confirmation', 'requires_capture', 'processing'].includes(intent.status)) {
              const cancelado = await stripe.paymentIntents.cancel(intentId);
              reserva.pago.estadoStripe = cancelado.status;
              reserva.pago.canceladoEn = new Date();
              await reserva.save();
            }
          } catch (e) {
            console.error(`Stripe error con PaymentIntent ${intentId}:`, e);
          }
        }
        // No se cambia estado
      }
    }

    const datos = reservas.map(r => ({
      id: r._id,
      serviceId: r.servicioId ? r.servicioId._id : null,
      serviceName: r.servicioId ? r.servicioId.nombre : 'Servicio eliminado',
      date: r.fechaPreferida.toISOString().split('T')[0],
      time: r.horarioDeseado,
      durationMinutes: r.duracionMinutos,
      userName: r.clienteId.nombreCompleto,
      status: traducir(r.estado)
    }));

    function traducir(e) {
      if (e === 'pendiente') return 'Pendiente';
      if (e === 'confirmada') return 'Aceptado';
      if (e === 'cancelada') return 'Rechazado';
      if (e === 'finalizada') return 'Finalizado';
      return 'Pendiente';
    }

    res.json(datos);

  } catch (error) {
    console.error('Error al obtener reservas del entrenador:', error);
    res.status(500).json({ error: 'Error al obtener reservas del entrenador' });
  }
});





router.patch('/:id', async (req, res) => {
  try {
    const { id }     = req.params;
    const { estado } = req.body;

    /*Validar estado */
    const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'finalizada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido.' });
    }

    /* Traer la reserva */
    const reserva = await Reserva.findById(id);
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada.' });

    const intentId = reserva.pago?.tokenPago;

    /* MANEJO DEL PAGO SEGÚN ESTADO */

    /* Confirmar (cobrar) */
    if (estado === 'confirmada') {
      if (!intentId) return res.status(400).json({ error: 'Sin PaymentIntent.' });

      const intent = await stripe.paymentIntents.retrieve(intentId);

      if (intent.status === 'requires_confirmation') {
        const confirmado = await stripe.paymentIntents.confirm(intentId);
        reserva.pago.estadoStripe = confirmado.status;   // 'succeeded'
        reserva.pago.confirmadoEn = new Date();
      } else if (intent.status !== 'succeeded') {
        return res.status(400).json({ error: `El pago está en '${intent.status}'.` });
      }
    }

    /*Cancelar (rechazar) */ // NO HAY QUE HACER NADA YA QUE LOS GET SE ENCARGAN DE LA LOGICA DE DEVOLUCION

    /* 4) Guardar el nuevo estado local */
    reserva.estado = estado;
    await reserva.save();

    return res.status(200).json(reserva);

  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    if (error?.raw?.message) {
      return res.status(400).json({ error: error.raw.message });
    }
    res.status(500).json({ error: 'Error del servidor al actualizar la reserva.' });
  }
});


// GET /api/reservas/por-servicio/:servicioId
router.get('/por-servicio/:servicioId', async (req, res) => {
  try {
    const { servicioId } = req.params;

    /* Traemos las reservas y populamos cliente + servicio */
    const reservas = await Reserva.find({ servicioId })
      .populate('clienteId', 'nombreCompleto email')
      .populate('servicioId', 'categoria')     // ← para la categoría
      .sort({ fechaPreferida: 1 })
      .lean();

    const categoria = reservas[0]?.servicioId?.categoria || 'Servicio';

    res.json({ reservas, categoria });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const clienteId = req.userId;

    const reservas = await Reserva.find({ clienteId })
      .populate({
        path: 'servicioId',
        select: 'descripcion categoria duracion precio zona entrenador',
        populate: { path: 'entrenador', select: 'nombreCompleto' }
      })
      .sort({ fechaPreferida: -1 })
      .lean();

    if (!reservas.length) {
      return res.status(404).json({ message: 'No se encontraron reservas.' });
    }

    const ahora = new Date();
    const dentroDeUnDia = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

    for (const r of reservas) {
      const [h, m] = r.horarioDeseado.split(':').map(Number);
      const [anio, mes, dia] = r.fechaPreferida.toISOString().slice(0, 10).split('-').map(Number);
      const fechaHora = new Date(anio, mes - 1, dia, h, m, 0);
      const intentId = r.pago?.tokenPago;

      if (r.estado === 'pendiente' && fechaHora <= dentroDeUnDia) {
        // Cancelar si nunca se cobró
        if (intentId) {
          try {
            const intent = await stripe.paymentIntents.retrieve(intentId);
            if (['requires_confirmation', 'requires_capture', 'processing'].includes(intent.status)) {
              await stripe.paymentIntents.cancel(intentId);
              r.pago.estadoStripe = 'canceled';
              r.pago.canceladoEn = new Date();
            }
          } catch (e) {
            console.error(`Stripe error con PaymentIntent ${intentId}:`, e);
          }
        }

        // Cambiar a cancelada
        await Reserva.updateOne(
          { _id: r._id },
          {
            estado: 'cancelada',
            'pago.estadoStripe': r.pago?.estadoStripe || 'canceled',
            'pago.canceladoEn': r.pago?.canceladoEn || new Date()
          }
        );
        r.estado = 'finalizada';
      }

      if (r.estado === 'confirmada' && fechaHora <= ahora) {
        // Cambiar a finalizada si ya pasó la fecha exacta
        await Reserva.updateOne({ _id: r._id }, { estado: 'finalizada' });
        r.estado = 'finalizada';
      }

      if (r.estado === 'cancelada' && fechaHora <= dentroDeUnDia) {
        if (intentId) {
          try {
            const intent = await stripe.paymentIntents.retrieve(intentId);
            if (['requires_confirmation', 'requires_capture', 'processing'].includes(intent.status)) {
              await stripe.paymentIntents.cancel(intentId);
              r.pago.estadoStripe = 'canceled';
              r.pago.canceladoEn = new Date();

              await Reserva.updateOne(
                { _id: r._id },
                {
                  'pago.estadoStripe': 'canceled',
                  'pago.canceladoEn': r.pago.canceladoEn
                }
              );
            }
          } catch (e) {
            console.error(`Stripe error con PaymentIntent ${intentId}:`, e);
          }
        }
        // NO cambiar el estado a finalizada
      }
    }

    // Añadir flag de reseña
    const resultado = await Promise.all(
      reservas.map(async (r) => {
        const existe = await Resena.exists({
          cliente: clienteId,
          reserva: r._id
        });

        return { ...r, tieneResena: !!existe };
      })
    );

    res.json(resultado);

  } catch (error) {
    console.error('Error al obtener reservas del cliente:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


// PATCH /api/reservas/:id/date - Actualizar la fecha de una reserva
router.patch('/:id/date', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, hora } = req.body;
    const clienteId = req.userId;
    
    if (!fecha || !hora) {
      return res.status(400).json({ error: 'La fecha y la hora son requeridas.' });
    }
    
    const reserva = await Reserva.findById(id);
    
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada.' });
    }
    
    if (reserva.clienteId.toString() !== clienteId) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta reserva.' });
    }
    
    const reservaActualizada = await Reserva.findByIdAndUpdate(
      id,
      { 
        fechaPreferida: fecha,
        horarioDeseado: hora 
      },
      { new: true }
    );
    
    res.status(200).json({ message: 'Fecha y hora actualizadas correctamente.', reserva: reservaActualizada });
  
  } catch (error) {
    console.error('Error al actualizar la fecha de la reserva:', error);
    res.status(500).json({ error: 'Error del servidor al actualizar la fecha.' });
  }
});

// PATCH /api/reservas/:id/status - Actualizar el status de una reserva
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const userId = req.userId;
    
    const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'finalizada'];
    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido.' });
    }
    
    const reserva = await Reserva.findById(id).populate('servicioId');
    
    if (!reserva.servicioId) {
      return res.status(404).json({ error: 'El servicio asociado a esta reserva ya no existe y no puede ser modificado.' });
    }
    
    const reservaActualizada = await Reserva.findByIdAndUpdate(
        id,
        { estado: estado },
        { new: true }
    );
    
    res.status(200).json({ message: 'Estado actualizado correctamente.', reserva: reservaActualizada });
  
  } catch (error) {
    console.error('Error al actualizar el estado de la reserva:', error);
    res.status(500).json({ error: 'Error del servidor al actualizar el estado.' });
  }
});



module.exports = router;
