// src/routes/devolucaoRoutes.js
const express = require('express');
const router = express.Router();
const devolucaoController = require('../controllers/devolucaoController');

// Rota para cliente buscar suas próprias devoluções
router.get('/cliente/devolucoes/:idUsuario', devolucaoController.getDevolucoesByClienteId);

// Rota para gestor buscar todas as devoluções (Painel Gestor)
router.get('/gestor/devolucoes', devolucaoController.getAllDevolucoes);

// **NOVA ROTA:** Para o cliente criar uma nova devolução
router.post('/cliente/nova-devolucao', devolucaoController.createNewDevolucao);

// **NOVA ROTA:** Para o histórico geral de devoluções (pode ser acessada pelo gestor)
router.get('/historico/devolucoes', devolucaoController.getHistoricoDevolucoes);


module.exports = router;
