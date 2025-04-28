const express = require('express');
const router = express.Router();
const empleadosController = require('../controllers/empleadosController');

// Rutas
router.post('/login', empleadosController.login);
router.get('/nif/:nif', empleadosController.getEmpleadoByNif);
router.get('/', empleadosController.getAllEmpleados);
router.post('/', empleadosController.createEmpleado);
router.patch('/:id/estatus', empleadosController.updateEmployeeStatus);
router.delete('/:id', empleadosController.deleteEmpleado);

module.exports = router;
