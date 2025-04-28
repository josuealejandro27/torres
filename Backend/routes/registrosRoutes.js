const express = require('express');
const router = express.Router();  // 👈 CORRECTO
const registrosController = require('../controllers/registrosController');

// Tus rutas
router.get('/', registrosController.getRegistros);
router.post('/', registrosController.createRegistro);
router.post('/buscar', registrosController.buscarRegistros);

module.exports = router;
