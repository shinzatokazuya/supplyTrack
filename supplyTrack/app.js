// app.js
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const authRoutes = require('./src/routes/authRoutes');

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

// Rotas da API
app.use('/api/auth', authRoutes);
// app.use('/api/clientes', clienteRoutes);
// app.use('/api/gestores', gestorRoutes);

// Rota principal para a página inicial
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/tela_inicial.html');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});
