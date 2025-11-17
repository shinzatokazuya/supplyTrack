/**
 * ROTAS DE AUTENTICAÇÃO
 *
 * Este arquivo contém as rotas relacionadas à autenticação de usuários:
 * - Login
 * - Registro (cadastro)
 * - Validação de sessão
 *
 * IMPORTANTE: Em produção, você DEVE usar bcrypt para hashear senhas!
 * Por enquanto, estamos comparando senhas em texto puro apenas para desenvolvimento.
 */

import { Router } from "express";
import { openDb } from "../db/connection.js";

const router = Router();

/**
 * POST /auth/login
 * Autentica um usuário no sistema
 *
 * Body esperado:
 * {
 *   "email": "usuario@exemplo.com",
 *   "senha": "senha123"
 * }
 *
 * Resposta de sucesso:
 * {
 *   "success": true,
 *   "usuario": { ...dados do usuário sem a senha }
 * }
 */
router.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Validação básica dos campos obrigatórios
        if (!email || !senha) {
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
        }

        // Validação de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de email inválido'
            });
        }

        // Busca o usuário no banco de dados pelo email
        const db = await openDb();
        const usuario = await db.get(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        // Verifica se o usuário existe
        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'Email ou senha incorretos'
            });
        }

        // Verifica se a senha está correta
        // ATENÇÃO: Em produção, use bcrypt.compare() aqui!
        // Exemplo: const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (usuario.senha !== senha) {
            return res.status(401).json({
                success: false,
                message: 'Email ou senha incorretos'
            });
        }

        // Remove a senha do objeto antes de enviar ao cliente
        // NUNCA envie a senha para o frontend, mesmo hasheada
        delete usuario.senha;

        // Login bem-sucedido
        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            usuario: usuario
        });

    } catch (erro) {
        console.error('Erro no login:', erro);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao processar login'
        });
    }
});

/**
 * POST /auth/register
 * Registra um novo usuário no sistema
 *
 * Body esperado:
 * {
 *   "nome": "João Silva",
 *   "email": "joao@exemplo.com",
 *   "senha": "senha123",
 *   "ra": "12345678" (opcional),
 *   "curso_id": 1 (opcional),
 *   "campus_id": 1 (opcional),
 *   "tipo_usuario": "estudante"
 * }
 */
router.post("/register", async (req, res) => {
    try {
        const { nome, email, senha, ra, curso_id, campus_id, tipo_usuario } = req.body;

        // Validação dos campos obrigatórios
        if (!nome || !email || !senha || !tipo_usuario) {
            return res.status(400).json({
                success: false,
                message: 'Nome, email, senha e tipo de usuário são obrigatórios'
            });
        }

        // Validação do tamanho mínimo do nome
        if (nome.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'O nome deve ter pelo menos 3 caracteres'
            });
        }

        // Validação de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de email inválido'
            });
        }

        // Validação do tamanho mínimo da senha
        if (senha.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'A senha deve ter pelo menos 6 caracteres'
            });
        }

        // Validação do tipo de usuário
        const tiposValidos = ['estudante', 'voluntario', 'admin'];
        if (!tiposValidos.includes(tipo_usuario)) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de usuário inválido'
            });
        }

        const db = await openDb();

        // Verifica se o email já está cadastrado
        const emailExistente = await db.get(
            'SELECT ID FROM usuarios WHERE email = ?',
            [email]
        );

        if (emailExistente) {
            return res.status(409).json({
                success: false,
                message: 'Este email já está cadastrado'
            });
        }

        // Se forneceu RA, verifica se já está em uso
        if (ra) {
            const raExistente = await db.get(
                'SELECT ID FROM usuarios WHERE ra = ?',
                [ra]
            );

            if (raExistente) {
                return res.status(409).json({
                    success: false,
                    message: 'Este RA já está cadastrado'
                });
            }
        }

        // IMPORTANTE: Em produção, hashear a senha antes de salvar!
        // Exemplo: const senhaHash = await bcrypt.hash(senha, 10);
        // E então use senhaHash no INSERT ao invés de senha

        // Insere o novo usuário no banco de dados
        const resultado = await db.run(
            `INSERT INTO usuarios (nome, email, ra, curso_id, campus_id, tipo_usuario, senha)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nome, email, ra || null, curso_id || null, campus_id || null, tipo_usuario, senha]
        );

        // Busca o usuário recém-criado para retornar seus dados
        const novoUsuario = await db.get(
            'SELECT ID, nome, email, ra, curso_id, campus_id, tipo_usuario, criado_em FROM usuarios WHERE ID = ?',
            [resultado.lastID]
        );

        // Cadastro bem-sucedido
        res.status(201).json({
            success: true,
            message: 'Usuário cadastrado com sucesso',
            usuario: novoUsuario
        });

    } catch (erro) {
        console.error('Erro no cadastro:', erro);

        // Trata erros de constraint (como email duplicado no nível do banco)
        if (erro.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({
                success: false,
                message: 'Email ou RA já cadastrado'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao processar cadastro'
        });
    }
});

/**
 * GET /auth/verify
 * Verifica se um token/sessão é válido
 * (Esta rota seria usada se implementarmos JWT no futuro)
 *
 * Por enquanto, apenas retorna informações sobre a validação esperada
 */
router.get("/verify", async (req, res) => {
    res.json({
        message: 'Esta rota seria usada para verificar tokens JWT no futuro',
        implemented: false
    });
});

/**
 * POST /auth/logout
 * Realiza logout do usuário
 * (No sistema atual, o logout é feito apenas no frontend limpando o localStorage)
 *
 * Esta rota existiria se usássemos tokens no backend
 */
router.post("/logout", async (req, res) => {
    res.json({
        success: true,
        message: 'Logout realizado com sucesso'
    });
});

export default router;
