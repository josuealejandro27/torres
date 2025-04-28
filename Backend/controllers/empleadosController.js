// Corregir el controlador de Empleados
const Empleado = require('../models/empleado');
const bcrypt = require('bcrypt'); // Agregar para manejar contraseñas seguras
const mongoose = require('mongoose');

// Crear un nuevo empleado
exports.createEmpleado = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    console.log('Archivo recibido:', req.file);

    // Verificar que req.body exista
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'No se recibieron datos del formulario'
      });
    }

    let fotoPath = '';
    if (req.file) {
      fotoPath = `uploads/${req.file.filename}`;
    }

    // Verificar si hay una contraseña antes de intentar hacer hash
    if (!req.body.password) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña es obligatoria'
      });
    }

    // Hash de la contraseña antes de guardarla
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Configurar datos del empleado
    const empleadoData = {
      nombre: req.body.nombre,
      nif: req.body.nif,
      email: req.body.email,
      telefono: req.body.telefono,
      departamento: req.body.departamento,
      puesto: req.body.puesto,
      horario: req.body.horario,
      entrada1: req.body.entrada1,
      salida1: req.body.salida1,
      password: hashedPassword, // Usar la contraseña hasheada
      foto: fotoPath,
      estatus: true,
      rol: req.body.rol || 'empleado'
    };

    // Manejar campos opcionales para horario mixto
    if (empleadoData.horario === 'mixto') {
      empleadoData.entrada2 = req.body.entrada2;
      empleadoData.salida2 = req.body.salida2;
    }

    const nuevoEmpleado = new Empleado(empleadoData);
    const empleadoGuardado = await nuevoEmpleado.save();

    // Eliminar password de la respuesta
    const empleadoResponse = empleadoGuardado.toObject();
    delete empleadoResponse.password;

    res.status(201).json({
      success: true,
      message: 'Empleado creado exitosamente',
      data: empleadoResponse
    });
  } catch (error) {
    console.error('Error al crear empleado:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// Método de login mejorado con bcrypt
exports.login = async (req, res) => {
  try {
    const { nif, password } = req.body;
    // Buscar empleado por NIF
    const empleado = await Empleado.findOne({ nif });
    // Validar existencia
    if (!empleado) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
    // Validar contraseña con bcrypt
    const passwordMatch = await bcrypt.compare(password, empleado.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
    // Validar que el usuario esté activo
    if (!empleado.estatus) {
      return res.status(403).json({ success: false, message: 'Usuario inactivo' });
    }
    
    // Login exitoso
    res.json({
      success: true,
      data: {
        id: empleado._id, // Corregido: usar _id en lugar de *id
        nif: empleado.nif,
        nombre: empleado.nombre,
        rol: empleado.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
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