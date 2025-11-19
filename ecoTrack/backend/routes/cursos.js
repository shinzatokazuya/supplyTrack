/**
 * ROTAS DE CURSOS
 *
 * Gerencia a listagem e manipulação de cursos disponíveis
 */

import { Router } from "express";
import { openDb } from "../db/connection.js";

const router = Router();

/**
 * GET /cursos
 * Lista todos os cursos
 */
router.get("/", async (req, res) => {
    try {
        const db = await openDb();
        const cursos = await db.all('SELECT * FROM cursos ORDER BY nome');
        res.json(cursos);
    } catch (erro) {
        console.error('Erro ao listar cursos:', erro);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar cursos'
        });
    }
});

/**
 * GET /cursos/:id
 * Busca um curso específico por ID
 */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const db = await openDb();

        const curso = await db.get('SELECT * FROM cursos WHERE ID = ?', [id]);

        if (!curso) {
            return res.status(404).json({
                success: false,
                message: 'Curso não encontrado'
            });
        }

        res.json(curso);
    } catch (erro) {
        console.error('Erro ao buscar curso:', erro);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar curso'
        });
    }
});

/**
 * POST /cursos
 * Cria um novo curso (apenas admin)
 */
router.post("/", async (req, res) => {
    try {
        const { nome, sigla } = req.body;

        if (!nome) {
            return res.status(400).json({
                success: false,
                message: 'Nome do curso é obrigatório'
            });
        }

        const db = await openDb();
        const resultado = await db.run(
            'INSERT INTO cursos (nome, sigla) VALUES (?, ?)',
            [nome, sigla || null]
        );

        const novoCurso = await db.get(
            'SELECT * FROM cursos WHERE ID = ?',
            [resultado.lastID]
        );

        res.status(201).json({
            success: true,
            message: 'Curso criado com sucesso',
            curso: novoCurso
        });
    } catch (erro) {
        console.error('Erro ao criar curso:', erro);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar curso'
        });
    }
});

export default router;
