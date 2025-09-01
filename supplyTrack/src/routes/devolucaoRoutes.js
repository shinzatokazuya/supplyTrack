// src/routes/devolucaoRoutes.js
const express = require('express');
const router = express.Router();
const devolucaoController = require('../controllers/devolucaoController');

router.get('/cliente/devolucoes/:idUsuario', devolucaoController.getDevolucoesByClienteId);

router.get('/gestor/devolucoes', devolucaoController.getAllDevolucoes);

router.post('/cliente/nova-devolucao', devolucaoController.createNewDevolucao);

router.get('/historico/devolucoes', devolucaoController.getHistoricoDevolucoes);

router.get('/devolucoes/:idDevolucao', devolucaoController.getDevolucaoById);

router.put('/devolucoes/:idDevolucao/status', devolucaoController.updateDevolucaoStatus);

module.exports = router;
