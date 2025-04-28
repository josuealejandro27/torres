const Empleado = require('../models/empleado');

// Crear un nuevo empleado
exports.createEmpleado = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);

    let fotoPath = '';
    if (req.file) {
      fotoPath = `uploads/${req.file.filename}`;
    }

    const empleadoData = {
      ...req.body,
      foto: fotoPath,
      estatus: true,  // Siempre activo
      rol: 'empleado' // Siempre empleado
    };

    const nuevoEmpleado = new Empleado(empleadoData);
    const empleadoGuardado = await nuevoEmpleado.save();

    res.status(201).json({
      success: true,
      message: 'Empleado creado exitosamente',
      data: empleadoGuardado
    });
  } catch (error) {
    console.error('Error al crear empleado:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Los demás métodos quedan igual
exports.login = async (req, res) => {
  try {
    const { nif, password } = req.body;

    // Buscar empleado por NIF
    const empleado = await Empleado.findOne({ nif });

    // Validar existencia y contraseña
    if (!empleado || empleado.password !== password) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    // Validar que sea rol admin
    if (empleado.rol !== 'admin') {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }

    // Login exitoso
    res.json({
      success: true,
      data: {
        _id: empleado._id,
        nombre: empleado.nombre,
        rol: empleado.rol
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Buscar empleado por NIF
exports.getEmpleadoByNif = async (req, res) => {
  try {
    const empleado = await Empleado.findOne({ nif: req.params.nif }).select('-password -__v');
    if (!empleado) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }
    res.json({ success: true, data: empleado });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obtener todos los empleados
exports.getAllEmpleados = async (req, res) => {
  try {
    const empleados = await Empleado.find().select('-password');
    res.json({ success: true, data: empleados });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Actualizar estatus del empleado
exports.updateEmployeeStatus = async (req, res) => {
  try {
    const { estatus } = req.body;
    if (typeof estatus !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Estatus debe ser true o false' });
    }
    const empleado = await Empleado.findByIdAndUpdate(req.params.id, { estatus }, { new: true }).select('-password');
    if (!empleado) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }
    res.json({ success: true, data: empleado });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Eliminar empleado
exports.deleteEmpleado = async (req, res) => {
  try {
    const empleado = await Empleado.findByIdAndDelete(req.params.id);
    if (!empleado) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }
    res.json({ success: true, message: 'Empleado eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};