const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/cadastro', authController.cadastrarUsuario);

module.exports = router;
