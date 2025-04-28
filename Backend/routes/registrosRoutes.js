const express = require('express');
const router = express.Router();
const registrosController = require('../controllers/registrosController');

router.post('/buscar', registrosController.buscarRegistros);
router.post('/', registrosController.createRegistro);
router.get('/', registrosController.getRegistros);

// NUEVO: Ruta para actualizar el comentario
router.patch('/:id/comentario', registrosController.updateComentario);

module.exports = router;
