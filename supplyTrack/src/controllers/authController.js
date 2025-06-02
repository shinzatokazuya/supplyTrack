// src/controllers/authController.js
const db = require('../database/db');
const bcrypt = require('bcryptjs');

const authController = {
    register: async (req, res) => {
        const { nome, email, senha, tipoUsuario } = req.body;

        if (!nome || !email || !senha || !tipoUsuario) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        if (!['cliente', 'gestor'].includes(tipoUsuario)) {
            return res.status(400).json({ message: 'Tipo de usuário inválido. Deve ser "cliente" ou "gestor".' });
        }

        try {
            // Verificar se o email já existe
            db.get('SELECT * FROM Usuarios WHERE email = ?', [email], async (err, row) => {
                if (err) {
                    console.error('Erro ao buscar usuário:', err.message);
                    return res.status(500).json({ message: 'Erro interno do servidor.' });
                }
                if (row) {
                    return res.status(409).json({ message: 'Email já cadastrado.' });
                }

                // Hash da senha
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(senha, salt);

                // Inserir novo usuário
                db.run(
                    'INSERT INTO Usuarios (nome, email, senha, tipoUsuario) VALUES (?, ?, ?, ?)',
                    [nome, email, hashedPassword, tipoUsuario],
                    function(err) {
                        if (err) {
                            console.error('Erro ao cadastrar usuário:', err.message);
                            return res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
                        }
                        res.status(201).json({ message: 'Usuário cadastrado com sucesso!', userId: this.lastID });
                    }
                );
            });
        } catch (error) {
            console.error('Erro no registro:', error);
            res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    },

    login: async (req, res) => {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
        }

        try {
            db.get('SELECT * FROM Usuarios WHERE email = ?', [email], async (err, user) => {
                if (err) {
                    console.error('Erro ao buscar usuário:', err.message);
                    return res.status(500).json({ message: 'Erro interno do servidor.' });
                }
                if (!user) {
                    return res.status(400).json({ message: 'Credenciais inválidas.' });
                }

                // Comparar senha
                const isMatch = await bcrypt.compare(senha, user.senha);
                if (!isMatch) {
                    return res.status(400).json({ message: 'Credenciais inválidas.' });
                }

                // Login bem-sucedido
                // Em uma aplicação real, você geraria um token JWT aqui.
                // Por simplicidade, vamos apenas retornar uma mensagem de sucesso e os dados básicos do usuário.
                res.status(200).json({
                    message: 'Login bem-sucedido!',
                    user: {
                        idUsuario: user.idUsuario,
                        nome: user.nome,
                        email: user.email,
                        tipoUsuario: user.tipoUsuario
                    }
                });
            });
        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }
};

module.exports = authController;
