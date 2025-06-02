// src/routes/devolucaoRoutes.js
const express = require('express');
const router = express.Router();
const devolucaoController = require('../controllers/devolucaoController');

// Rota para cliente buscar suas próprias devoluções
router.get('/cliente/devolucoes/:idUsuario', devolucaoController.getDevolucoesByClienteId);

// Rota para gestor buscar todas as devoluções
router.get('/gestor/devolucoes', devolucaoController.getAllDevolucoes);

module.exports = router;
