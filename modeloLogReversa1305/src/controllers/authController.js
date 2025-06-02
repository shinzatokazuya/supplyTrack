const db = require('../database/db'); // Importa a conexão com o banco de dados
const bcrypt = require('bcrypt'); // Para hash de senhas
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secreta_minha_chave_jwt_muito_segura';

const authController = {
    cadastrarUsuario: async (req, res) => {
        // As chaves no req.body devem corresponder aos 'name' atributos do seu formulário HTML
        const { nome, email, senha, tipoUsuario } = req.body;

        // Validação básica
        if (!nome || !email || !senha || !tipoUsuario) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        // Hash da senha
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(senha, saltRounds);

        // Inserir usuário na tabela 'Usuarios' com os nomes das colunas corretos
        const sql = `INSERT INTO Usuarios (nome, email, senha, tipoUsuario) VALUES (?, ?, ?, ?)`;
        db.run(sql,
            [nome, email, hashedPassword, tipoUsuario],
            function(err) {
                if (err) {
                    console.error('Erro ao inserir usuário:', err.message);
                    if (err.message.includes('UNIQUE constraint failed: Usuarios.email')) { // Adapte para o nome da tabela e coluna
                        return res.status(409).json({ message: 'E-mail já cadastrado.' });
                    }
                    return res.status(500).json({ message: 'Erro ao registrar usuário.' });
                }
                res.status(201).json({ message: 'Usuário registrado com sucesso!', idUsuario: this.lastID });
            }
        );
    },

    loginUsuario: (req, res) => {
        const { email, senha } = req.body; // Adaptando para 'senha'

        console.log("LOGIN: Tentativa de login para o email:", email); // Log de entrada
        console.log("LOGIN: Senha recebida (não logar em produção!):", senha); // APENAS PARA DEBUG. NUNCA EM PRODUÇÃO!

        // Buscar usuário na tabela 'Usuarios'
        db.get('SELECT * FROM Usuarios WHERE email = ?', [email], async (err, user) => { // 'Usuarios' e 'email'
            if (err) {
                console.error('Erro ao buscar usuário:', err.message);
                return res.status(500).json({ message: 'Erro no servidor.' });
            }
            if (!user) {
                return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
            }

            // Comparar a senha fornecida com a senha hash do banco de dados
            const isMatch = await bcrypt.compare(senha, user.senha); // Comparar 'senha' do input com 'user.senha' do DB
            if (!isMatch) {
                return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
            }

            const token = jwt.sign(
                { idUsuario: user.idUsuario, tipoUsuario: user.tipoUsuario }, // Payload do token
                JWT_SECRET, // Chave secreta
                { expiresIn: '1h' } // Token expira em 1 hora
            );

            // Retornar dados do usuário, incluindo tipoUsuario para redirecionamento
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
    }
};

module.exports = authController;
