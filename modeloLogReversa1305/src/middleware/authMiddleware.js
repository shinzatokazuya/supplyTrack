// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Chave secreta (DEVE SER A MESMA DO authController.js)
const JWT_SECRET = process.env.JWT_SECRET || 'super_secreta_minha_chave_jwt_muito_segura';

const authMiddleware = (req, res, next) => {
    // Obter o token do cabeçalho Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer TOKEN

    console.log("Middleware: Token recebido no cabeçalho:", token ? token.substring(0, 20) + '...' : 'NULO/VAZIO'); // Log parcial do token
    console.log("Middleware: Chave secreta usada:", JWT_SECRET); // Verificar a chave

    if (token == null) {
        console.warn("Middleware: Token não fornecido. Acesso negado.");
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                console.warn("Middleware: Token expirado.");
                return res.status(403).json({ message: 'Token expirado. Faça login novamente.' });
            }
            console.error("Middleware: Token inválido:", err);
            return res.status(403).json({ message: 'Token inválido.' });
        }

        // O token é válido, armazene as informações do usuário na requisição
        // para que as rotas subsequentes possam acessá-lo.
        req.user = user; // user = { idUsuario: ..., tipoUsuario: ... }
        console.log("Middleware: Token válido. Usuário autenticado:", user.idUsuario, user.tipoUsuario);
        next(); // Prossegue para a próxima função middleware ou rota
    });
};

module.exports = authMiddleware;
