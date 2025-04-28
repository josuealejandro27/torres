// routes/empleadosRoutes.js
const express = require('express');
const router = express.Router();
const empleadosController = require('../controllers/empleadosController');
const multer = require('multer');
const path = require('path');

// Configuración de multer para guardar archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Usar timestamp para evitar nombres duplicados
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


// Rutas
router.post('/login', empleadosController.login);
router.get('/nif/:nif', empleadosController.getEmpleadoByNif);
router.get('/', empleadosController.getAllEmpleados);
// Añadir middleware multer para procesar la subida de archivos
router.post('/', upload.single('foto'), empleadosController.createEmpleado);
router.patch('/:id/estatus', empleadosController.updateEmployeeStatus);
router.delete('/:id', empleadosController.deleteEmpleado);
router.post('/', (req, res, next) => {
    console.log('Headers:', req.headers);
    console.log('Request body antes de multer:', req.body);
    next();
  }, upload.single('foto'), (req, res, next) => {
    console.log('Request body después de multer:', req.body);
    next();
  }, empleadosController.createEmpleado);
module.exports = router;