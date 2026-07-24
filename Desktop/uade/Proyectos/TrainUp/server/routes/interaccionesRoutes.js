const express = require("express");
const router = express.Router();
const InteraccionServicio = require("../modelos/InteraccionServicio");
const {Servicio} = require("../modelos/Servicio");

// routes/interacciones.js
router.post("/", async (req, res) => {
  try {
    const { servicioId, tipo } = req.body;
    
    const servicio = await Servicio.findById(servicioId);
    if (!servicio) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    /*ventana anti‑duplicado (1 seg) */
    const ahora = new Date();
    const haceUnSegundo = new Date(ahora.getTime() - 1000);

    /*Buscar‑o‑insertar en una única operación */
    const docExistente = await InteraccionServicio.findOneAndUpdate(
      {
        servicio:   servicio._id,
        entrenador: servicio.entrenador,
        tipo,
        fecha: { $gte: haceUnSegundo }          // solo miramos la última ventana
      },
      {
        // Estos campos se insertan *solo* si NO existe un documento que cumpla el filtro
        $setOnInsert: {
          servicio:   servicio._id,
          entrenador: servicio.entrenador,
          tipo,
          fecha: ahora
        }
      },
      {
        upsert: true,       // crea si no existe
        new: false          // si devuelve null si se acaba de insertar
      }
    );

    if (docExistente) {
      // Ya había una interacción registrada en el último segundo
      return res
        .status(200)
        .json({ mensaje: "Interacción ya registrada recientemente" });
    }

    // Si llegamos aca es porque *se insertó* una nueva interacción
    return res.status(201).json({ mensaje: "Interacción creada" });

  } catch (error) {
    console.error("Error al crear interacción:", error);
    res.status(500).json({ error: "Error al registrar la interacción" });
  }
});


router.get("/estadisticas/:entrenadorId", async (req, res) => {
  try {
    const { entrenadorId } = req.params;

    const visualizaciones = await InteraccionServicio.countDocuments({
      entrenador: entrenadorId,
      tipo: "visualizacion",
    });

    const compras = await InteraccionServicio.countDocuments({
      entrenador: entrenadorId,
      tipo: "compra",
    });

    const tasaConversion =
      visualizaciones > 0
        ? ((compras / visualizaciones) * 100).toFixed(1)
        : "0";

    res.json({
      visualizaciones,
      compras,
      tasaConversion,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas del entrenador" });
  }
});

module.exports = router;
