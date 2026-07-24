const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Resena = require('../modelos/Reseñas');
const {Servicio} = require('../modelos/Servicio');
const User = require('../modelos/User');
const Reserva = require('../modelos/Reservas');
const authMiddleware = require('../middlewares/authMiddleware');

/* PATCH /api/resenas/:id/responder */
router.patch('/:id/responder', async (req, res) => {
  try {
    const { respuesta } = req.body;
    const { id } = req.params;

    const resena = await Resena.findByIdAndUpdate(
      id,
      { respuesta },
      { new: true }
    );

    if (!resena) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    return res.json(resena);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al responder la reseña' });
  }
});

/* GET /api/resenas/entrenador/:id → reseñas de un entrenador */
router.get('/entrenador/:id', async (req, res) => {
  try {
    const entrenadorId = req.params.id;

    const reseñas = await Resena.find({ entrenador: entrenadorId })
      .populate('cliente', 'nombreCompleto')
      .populate('servicio', 'categoria');

    res.json(reseñas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener reseñas del entrenador' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { reservaId, calificacion, comentario } = req.body;
    const clienteId = req.userId;

    if (!reservaId || !calificacion) {
      return res.status(400).json({ message: 'Faltan datos obligatorios.' });
    }

    // Buscar la reserva y verificar propiedad
    const reserva = await Reserva.findById(reservaId).populate({
      path: 'servicioId',
      select: 'entrenador',
    });

    if (!reserva) {
      return res.status(404).json({ message: 'Reserva no encontrada.' });
    }

    if (reserva.clienteId.toString() !== clienteId) {
      return res.status(403).json({ message: 'No tienes permiso para reseñar esta reserva.' });
    }

    // Crear reseña sin controlar duplicados
    const nuevaResena = new Resena({
      cliente: clienteId,
      servicio: reserva.servicioId._id,
      reserva: reserva._id,
      entrenador: reserva.servicioId.entrenador,
      calificacion,
      comentario,
    });

    const resenaGuardada = await nuevaResena.save();
    return res.status(201).json(resenaGuardada);

  } catch (error) {
    console.error('Error al crear reseña:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
});

// GET /api/resenas/me - Trae las reseñas del cliente autenticado
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const clienteId = req.userId;
    
    const resenas = await Resena.find({ cliente: clienteId })
      .populate('servicio', 'categoria')
      .populate('entrenador', 'nombreCompleto')
      .sort({ createdAt: -1 });
    
    res.json(resenas);
  
  } catch (error) {
    console.error('Error al obtener las reseñas del cliente:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

/* GET /api/resenas/promedio/:entrenadorId */
router.get('/promedio/:entrenadorId', async (req, res) => {
  const { entrenadorId } = req.params;

  try {
    const resultado = await Resena.aggregate([
      { $match: { entrenador: new mongoose.Types.ObjectId(entrenadorId) } },
      {
        $group: {
          _id: null,
          promedio: { $avg: '$calificacion' },
          cantidad: { $sum: 1 },
        },
      },
    ]);

    if (resultado.length === 0) {
      return res.json({ promedio: 0, cantidad: 0 });
    }

    const { promedio, cantidad } = resultado[0];
    res.json({ promedio: Number(promedio.toFixed(2)), cantidad });
  } catch (error) {
    console.error('Error al calcular promedio:', error);
    res.status(500).json({ message: 'Error al calcular el promedio de calificaciones' });
  }
});

/* GET /api/resenas/promedio-servicio/:servicioId */
router.get('/promedio-servicio/:servicioId', async (req, res) => {
  const { servicioId } = req.params;

  try {
    const resultado = await Resena.aggregate([
      { $match: { servicio: new mongoose.Types.ObjectId(servicioId) } },
      {
        $group: {
          _id: null,
          promedio: { $avg: '$calificacion' },
          cantidad: { $sum: 1 },
        },
      },
    ]);

    if (resultado.length === 0) {
      return res.json({ promedio: 0, cantidad: 0 });
    }

    const { promedio, cantidad } = resultado[0];
    res.json({ promedio: Number(promedio.toFixed(2)), cantidad });
  } catch (err) {
    console.error('Error promedio serv.', err);
    res.status(500).json({ message: 'Error al calcular promedio' });
  }
});

module.exports = router;
