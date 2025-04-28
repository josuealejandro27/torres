const Registro = require('../models/registro');
const Empleado = require('../models/empleado');

function obtenerFechaYHoraLocal() {
  const tz = 'America/Mexico_City';
  const ahora = new Date();
  const fechaLocal = ahora.toLocaleDateString('en-CA', { timeZone: tz });
  const horaLocal = ahora.toLocaleTimeString('es-MX', { timeZone: tz, hour12: false });
  return { fechaLocal, horaLocal };
}

// Crear un nuevo registro
async function createRegistro(req, res) {
  try {
    const nifEmpleado = req.body.nif;
    if (!nifEmpleado) {
      return res.status(400).json({ success: false, error: 'NIF es obligatorio' });
    }

    const empleado = await Empleado.findOne({ nif: nifEmpleado });
    if (!empleado) {
      return res.status(404).json({ success: false, error: 'Empleado no encontrado' });
    }

    const { fechaLocal, horaLocal } = obtenerFechaYHoraLocal();

    const registrosHoy = await Registro.find({ nif: nifEmpleado, fecha: fechaLocal });
    const totalRegistrosHoy = registrosHoy.length;

    let nuevoRegistro = new Registro({
      nif: nifEmpleado,
      fecha: fechaLocal,
      hora: horaLocal,
      faltas: 0,
      retardo: 0,
      comentario: ''
    });

    if (empleado.horario === 'corrido') {
      if (totalRegistrosHoy === 0) {
        const horaEntradaProg = empleado.entrada1;
        if (horaEntradaProg) {
          const [hProg, mProg] = horaEntradaProg.split(':').map(Number);
          const [hAct, mAct] = horaLocal.split(':').map(Number);
          const minutosProg = hProg * 60 + mProg;
          const minutosAct = hAct * 60 + mAct;
          const diferencia = minutosAct - minutosProg;

          if (diferencia > 10) {
            nuevoRegistro.faltas = 1;
          } else if (diferencia > 5) {
            nuevoRegistro.retardo = diferencia;
          }
        }
      } else if (totalRegistrosHoy === 1) {
        // Segunda marcación (salida), sin necesidad de calcular faltas ni retardos
      } else {
        return res.status(400).json({ success: false, error: 'Ya completó su jornada corrido hoy' });
      }
    } else if (empleado.horario === 'mixto') {
      if (totalRegistrosHoy === 0 || totalRegistrosHoy === 2) {
        const horaEntradaProg = totalRegistrosHoy === 0 ? empleado.entrada1 : empleado.entrada2;
        if (horaEntradaProg) {
          const [hProg, mProg] = horaEntradaProg.split(':').map(Number);
          const [hAct, mAct] = horaLocal.split(':').map(Number);
          const minutosProg = hProg * 60 + mProg;
          const minutosAct = hAct * 60 + mAct;
          const diferencia = minutosAct - minutosProg;

          if (diferencia > 10) {
            nuevoRegistro.faltas = 1;
          } else if (diferencia > 5) {
            nuevoRegistro.retardo = diferencia;
          }
        }
      } else if (totalRegistrosHoy === 1 || totalRegistrosHoy === 3) {
        // Segunda o cuarta marcación (salidas)
      } else {
        return res.status(400).json({ success: false, error: 'Ya completó su jornada mixta hoy' });
      }
    }

    const registroGuardado = await nuevoRegistro.save();

    return res.status(201).json({
      success: true,
      mensaje: 'Registro exitoso',
      registro: registroGuardado
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Error al registrar asistencia' });
  }
}

// Obtener todos los registros
async function getRegistros(req, res) {
  try {
    const registros = await Registro.find().sort({ fecha: -1, hora: -1 });
    res.json({ success: true, data: registros });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Buscar registros según filtros
async function buscarRegistros(req, res) {
  try {
    const { nif, fechaInicio, fechaFin, faltas } = req.body;
    const filtro = {};

    if (nif) filtro.nif = nif;
    if (fechaInicio && fechaFin) {
      filtro.fecha = { $gte: fechaInicio, $lte: fechaFin };
    }
    if (faltas === '1') {
      filtro.faltas = { $gte: 1 };
    }

    const registros = await Registro.find(filtro);
    res.json(registros);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al buscar registros' });
  }
}

// 🔥 Método para actualizar solo el comentario
async function updateComentario(req, res) {
  try {
    const { comentario } = req.body;
    const { id } = req.params;

    if (typeof comentario !== 'string') {
      return res.status(400).json({ success: false, error: 'Comentario inválido' });
    }

    const registroActualizado = await Registro.findByIdAndUpdate(
      id,
      { comentario: comentario },
      { new: true }
    );

    if (!registroActualizado) {
      return res.status(404).json({ success: false, error: 'Registro no encontrado' });
    }

    res.json({ success: true, data: registroActualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al actualizar comentario' });
  }
}

module.exports = {
  createRegistro,
  getRegistros,
  buscarRegistros,
  updateComentario // 🔥 Exportamos el nuevo
};
