/**
 * ROTAS DE USUÁRIOS
 *
 * Este arquivo gerencia operações relacionadas aos usuários do sistema.
 */

import { Router } from "express";
import { openDb } from "../db/connection.js";

const router = Router();

/**
 * GET /usuarios
 * Lista todos os usuários (sem expor senhas)
 */
router.get("/", async (req, res) => {
    try {
        const db = await openDb();

        // Busca todos os usuários, mas exclui as senhas por segurança
        const usuarios = await db.all(`
            SELECT
                ID, nome, email, ra, curso_id, campus_id,
                tipo_usuario, criado_em
            FROM usuarios
            ORDER BY criado_em DESC
        `);

        res.json(usuarios);

    } catch (erro) {
        console.error('Erro ao listar usuários:', erro);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar usuários'
        });
    }
});

/**
 * GET /usuarios/:id
 * Busca um usuário específico por ID
 */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const db = await openDb();

        const usuario = await db.get(`
            SELECT
                u.ID, u.nome, u.email, u.ra, u.curso_id, u.campus_id,
                u.tipo_usuario, u.criado_em,
                c.nome as curso_nome,
                ca.nome as campus_nome, ca.cidade as campus_cidade
            FROM usuarios u
            LEFT JOIN cursos c ON u.curso_id = c.ID
            LEFT JOIN campi ca ON u.campus_id = ca.ID
            WHERE u.ID = ?
        `, [id]);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        res.json(usuario);

    } catch (erro) {
        console.error('Erro ao buscar usuário:', erro);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar usuário'
        });
    }
});

/**
 * PUT /usuarios/:id
 * Atualiza dados de um usuário
 */
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, ra, curso_id, campus_id } = req.body;

        const db = await openDb();

        // Verifica se o usuário existe
        const usuarioExiste = await db.get('SELECT ID FROM usuarios WHERE ID = ?', [id]);

        if (!usuarioExiste) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Atualiza apenas os campos fornecidos
        await db.run(`
            UPDATE usuarios
            SET nome = COALESCE(?, nome),
                email = COALESCE(?, email),
                ra = COALESCE(?, ra),
                curso_id = COALESCE(?, curso_id),
                campus_id = COALESCE(?, campus_id)
            WHERE ID = ?
        `, [nome, email, ra, curso_id, campus_id, id]);

        // Busca o usuário atualizado
        const usuarioAtualizado = await db.get(`
            SELECT ID, nome, email, ra, curso_id, campus_id, tipo_usuario, criado_em
            FROM usuarios WHERE ID = ?
        `, [id]);

        res.json({
            success: true,
            message: 'Usuário atualizado com sucesso',
            usuario: usuarioAtualizado
        });

    } catch (erro) {
        console.error('Erro ao atualizar usuário:', erro);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar usuário'
        });
    }
});

/**
 * DELETE /usuarios/:id
 * Remove um usuário (apenas admin deve ter acesso)
 */
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const db = await openDb();

        // Verifica se o usuário existe
        const usuario = await db.get('SELECT ID FROM usuarios WHERE ID = ?', [id]);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Remove o usuário
        await db.run('DELETE FROM usuarios WHERE ID = ?', [id]);

        res.json({
            success: true,
            message: 'Usuário removido com sucesso'
        });

    } catch (erro) {
        console.error('Erro ao remover usuário:', erro);
        res.status(500).json({
            success: false,
            message: 'Erro ao remover usuário'
        });
    }
});

export default router;
