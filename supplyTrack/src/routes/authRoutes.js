const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/cadastro', authController.cadastrarUsuario);
<<<<<<< HEAD:modeloLogReversa1305/src/routes/authRoutes.js
router.post('/login', authController.loginUsuario);
=======
router.post('/login', authController.login)
>>>>>>> 5fe1efb8ddc7c017b600200968d52d787fe27502:supplyTrack/src/routes/authRoutes.js

module.exports = router;
