// app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./src/routes/authRoutes');
const clienteRoutes = require('./src/routes/clienteRoutes'); // Se tiver
const gestorRoutes = require('./src/routes/gestorRoutes');   // Se tiver
const authMiddleware = require('./src/middleware/authMiddleware'); // <<< ADICIONE ESTA LINHA

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// Rotas de autenticação (não precisam de proteção de token para login/cadastro)
app.use('/api/auth', authRoutes);

// Rotas protegidas (todas as rotas que acessam o painel ou dados do usuário)
// Aplica o middleware de autenticação ANTES das rotas de cliente e gestor
app.use('/api/cliente', authMiddleware, clienteRoutes); // Exemplo
app.use('/api/gestor', authMiddleware, gestorRoutes);   // Exemplo

// Rotas que servem arquivos HTML de painel também podem ser protegidas
app.get('/html/painel_cliente.html', authMiddleware, (req, res) => {
    // Redirecione ou sirva o arquivo somente se o middleware passar
    // E idealmente, verificar req.user.tipoUsuario === 'cliente' aqui também
    if (req.user && req.user.tipoUsuario === 'cliente') {
        res.sendFile(path.join(__dirname, 'public', 'html', 'painel_cliente.html'));
    } else {
        // Se o token for válido, mas o tipo de usuário não for o esperado para esta página
        res.status(403).send('Acesso não autorizado para esta página.');
    }
});

app.get('/html/painel_gestor.html', authMiddleware, (req, res) => {
    if (req.user && req.user.tipoUsuario === 'gestor') {
        res.sendFile(path.join(__dirname, 'public', 'html', 'painel_gestor.html'));
    } else {
        res.status(403).send('Acesso não autorizado para esta página.');
    }
});

// Rota inicial (não protegida, para que o usuário possa acessar o login)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'tela_inicial.html'));
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
