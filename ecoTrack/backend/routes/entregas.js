/**
 * ROTAS DE ENTREGAS
 *
 * Este arquivo gerencia todas as operações relacionadas a entregas:
 * - Listar todas as entregas
 * - Buscar entregas por usuário
 * - Criar nova entrega
 * - Validar entrega (voluntário)
 * - Rejeitar entrega (voluntário)
 */

import { Router } from "express";
import { openDb } from "../db/connection.js";

const router = Router();

/**
 * GET /entregas
 * Lista todas as entregas do sistema
 */
router.get("/", async (req, res) => {
    try {
        const db = await openDb();

        const entregas = await db.all(`
            SELECT
                e.*,
                u.nome as usuario_nome,
                u.email as usuario_email,
                v.nome as validador_nome
            FROM entregas e
            LEFT JOIN usuarios u ON e.usuario_id = u.ID
            LEFT JOIN usuarios v ON e.validado_por = v.ID
            ORDER BY e.criado_em DESC
        `);

        // Para cada entrega, busca os itens
        for (let entrega of entregas) {
            const itens = await db.all(`
                SELECT
                    ie.*,
                    tr.nome as tipo_residuo_nome,
                    tr.pontos as pontos_por_kg,
                    tr.cor as tipo_residuo_cor
                FROM itens_entrega ie
                LEFT JOIN tipos_residuos tr ON ie.tipo_residuo_id = tr.ID
                WHERE ie.entrega_id = ?
            `, [entrega.ID]);

            entrega.itens = itens;

            // Calcula peso total
            entrega.peso_total = itens.reduce((sum, item) =>
                sum + (item.peso_atual || item.peso_estimado || 0), 0
            );
        }

        res.json(entregas);

    } catch (erro) {
        console.error('Erro ao listar entregas:', erro);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar entregas'
        });
    }
});

/**
 * GET /entregas/:id
 * Busca uma entrega específica por ID
 */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const db = await openDb();

        const entrega = await db.get(`
            SELECT
                e.*,
                u.nome as usuario_nome,
                u.email as usuario_email,
                u.ra as usuario_ra,
                v.nome as validador_nome
            FROM entregas e
            LEFT JOIN usuarios u ON e.usuario_id = u.ID
            LEFT JOIN usuarios v ON e.validado_por = v.ID
            WHERE e.ID = ?
        `, [id]);

        if (!entrega) {
            return res.status(404).json({
                success: false,
                message: 'Entrega não encontrada'
            });
        }

        // Busca os itens da entrega
        const itens = await db.all(`
            SELECT
                ie.*,
                tr.nome as tipo_residuo_nome,
                tr.descricao as tipo_residuo_descricao,
                tr.pontos as pontos_por_kg,
                tr.cor as tipo_residuo_cor
            FROM itens_entrega ie
            LEFT JOIN tipos_residuos tr ON ie.tipo_residuo_id = tr.ID
            WHERE ie.entrega_id = ?
        `, [id]);

        entrega.itens = itens;
        entrega.peso_total = itens.reduce((sum, item) =>
            sum + (item.peso_atual || item.peso_estimado || 0), 0
        );

        res.json(entrega);

    } catch (erro) {
        console.error('Erro ao buscar entrega:', erro);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar entrega'
        });
    }
});

/**
 * GET /entregas/usuario/:usuarioId
 * Lista todas as entregas de um usuário específico
 */
router.get("/usuario/:usuarioId", async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const db = await openDb();

        const entregas = await db.all(`
            SELECT
                e.*,
                v.nome as validador_nome
            FROM entregas e
            LEFT JOIN usuarios v ON e.validado_por = v.ID
            WHERE e.usuario_id = ?
            ORDER BY e.criado_em DESC
        `, [usuarioId]);

        // Para cada entrega, busca os itens
        for (let entrega of entregas) {
            const itens = await db.all(`
                SELECT
                    ie.*,
                    tr.nome as tipo_residuo_nome,
                    tr.pontos as pontos_por_kg,
                    tr.cor as tipo_residuo_cor
                FROM itens_entrega ie
                LEFT JOIN tipos_residuos tr ON ie.tipo_residuo_id = tr.ID
                WHERE ie.entrega_id = ?
            `, [entrega.ID]);

            entrega.itens = itens;
            entrega.peso_total = itens.reduce((sum, item) =>
                sum + (item.peso_atual || item.peso_estimado || 0), 0
            );
        }

        res.json(entregas);

    } catch (erro) {
        console.error('Erro ao listar entregas do usuário:', erro);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar entregas do usuário'
        });
    }
});

/**
 * POST /entregas
 * Cria uma nova entrega
 *
 * Body esperado:
 * {
 *   "usuario_id": 1,
 *   "avisos": "Observações sobre a entrega",
 *   "pontos_esperados": 150,
 *   "itens": [
 *     {
 *       "tipo_residuo_id": 1,
 *       "peso_estimado": 5.5
 *     }
 *   ]
 * }
 */
router.post("/", async (req, res) => {
    try {
        const { usuario_id, avisos, pontos_esperados, itens } = req.body;

        // Validações
        if (!usuario_id) {
            return res.status(400).json({
                success: false,
                message: 'ID do usuário é obrigatório'
            });
        }

        if (!itens || itens.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'É necessário adicionar pelo menos um item'
            });
        }

        // Valida cada item
        for (let item of itens) {
            if (!item.tipo_residuo_id || !item.peso_estimado || item.peso_estimado <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos os itens devem ter tipo de resíduo e peso estimado válido'
                });
            }
        }

        const db = await openDb();

        // Verifica se o usuário existe
        const usuario = await db.get('SELECT ID FROM usuarios WHERE ID = ?', [usuario_id]);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Insere a entrega
        const resultado = await db.run(`
            INSERT INTO entregas (
                usuario_id,
                status,
                avisos,
                pontos_esperados
            ) VALUES (?, 'pendente', ?, ?)
        `, [usuario_id, avisos || null, pontos_esperados || 0]);

        const entregaId = resultado.lastID;

        // Insere os itens da entrega
        for (let item of itens) {
            await db.run(`
                INSERT INTO itens_entrega (
                    entrega_id,
                    tipo_residuo_id,
                    peso_estimado
                ) VALUES (?, ?, ?)
            `, [entregaId, item.tipo_residuo_id, item.peso_estimado]);
        }

        // Busca a entrega completa para retornar
        const novaEntrega = await db.get(`
            SELECT * FROM entregas WHERE ID = ?
        `, [entregaId]);

        const itensCompletos = await db.all(`
            SELECT
                ie.*,
                tr.nome as tipo_residuo_nome,
                tr.pontos as pontos_por_kg
            FROM itens_entrega ie
            LEFT JOIN tipos_residuos tr ON ie.tipo_residuo_id = tr.ID
            WHERE ie.entrega_id = ?
        `, [entregaId]);

        novaEntrega.itens = itensCompletos;

        res.status(201).json({
            success: true,
            message: 'Entrega criada com sucesso',
            entrega: novaEntrega
        });

    } catch (erro) {
        console.error('Erro ao criar entrega:', erro);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar entrega'
        });
    }
});

/**
 * PUT /entregas/:id/validar
 * Valida uma entrega (apenas para voluntários e admin)
 *
 * Body esperado:
 * {
 *   "validado_por": 2,
 *   "itens": [
 *     {
 *       "id": 1,
 *       "peso_atual": 5.2
 *     }
 *   ],
 *   "avisos_validacao": "Observações do voluntário"
 * }
 */
router.put("/:id/validar", async (req, res) => {
    try {
        const { id } = req.params;
        const { validado_por, itens, avisos_validacao } = req.body;

        if (!validado_por) {
            return res.status(400).json({
                success: false,
                message: 'ID do validador é obrigatório'
            });
        }

        const db = await openDb();

        // Verifica se a entrega existe e está pendente
        const entrega = await db.get(
            'SELECT * FROM entregas WHERE ID = ? AND status = ?',
            [id, 'pendente']
        );

        if (!entrega) {
            return res.status(404).json({
                success: false,
                message: 'Entrega não encontrada ou já foi processada'
            });
        }

        // Calcula pontos reais baseado nos pesos atuais
        let pontosRecebidos = 0;

        // Atualiza os pesos dos itens se fornecidos
        if (itens && itens.length > 0) {
            for (let item of itens) {
                if (item.id && item.peso_atual !== undefined) {
                    await db.run(`
                        UPDATE itens_entrega
                        SET peso_atual = ?
                        WHERE ID = ? AND entrega_id = ?
                    `, [item.peso_atual, item.id, id]);
                }
            }
        }

        // Recalcula pontos
        const itensEntrega = await db.all(`
            SELECT
                ie.peso_atual,
                ie.peso_estimado,
                tr.pontos
            FROM itens_entrega ie
            LEFT JOIN tipos_residuos tr ON ie.tipo_residuo_id = tr.ID
            WHERE ie.entrega_id = ?
        `, [id]);

        itensEntrega.forEach(item => {
            const peso = item.peso_atual || item.peso_estimado || 0;
            pontosRecebidos += peso * (item.pontos || 0);
        });

        // Atualiza a entrega como validada
        await db.run(`
            UPDATE entregas
            SET
                status = 'validado',
                validado_por = ?,
                validado_em = CURRENT_TIMESTAMP,
                pontos_recebidos = ?,
                avisos_validacao = ?
            WHERE ID = ?
        `, [validado_por, pontosRecebidos, avisos_validacao || null, id]);

        // Busca entrega atualizada
        const entregaAtualizada = await db.get(
            'SELECT * FROM entregas WHERE ID = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Entrega validada com sucesso',
            entrega: entregaAtualizada
        });

    } catch (erro) {
        console.error('Erro ao validar entrega:', erro);
        res.status(500).json({
            success: false,
            message: 'Erro ao validar entrega'
        });
    }
});

/**
 * PUT /entregas/:id/rejeitar
 * Rejeita uma entrega
 *
 * Body esperado:
 * {
 *   "validado_por": 2,
 *   "avisos_validacao": "Motivo da rejeição"
 * }
 */
router.put("/:id/rejeitar", async (req, res) => {
    try {
        const { id } = req.params;
        const { validado_por, avisos_validacao } = req.body;

        if (!validado_por) {
            return res.status(400).json({
                success: false,
                message: 'ID do validador é obrigatório'
            });
        }

        if (!avisos_validacao) {
            return res.status(400).json({
                success: false,
                message: 'É necessário informar o motivo da rejeição'
            });
        }

        const db = await openDb();

        // Verifica se a entrega existe e está pendente
        const entrega = await db.get(
            'SELECT * FROM entregas WHERE ID = ? AND status = ?',
            [id, 'pendente']
        );

        if (!entrega) {
            return res.status(404).json({
                success: false,
                message: 'Entrega não encontrada ou já foi processada'
            });
        }

        // Atualiza como rejeitada
        await db.run(`
            UPDATE entregas
            SET
                status = 'rejeitado',
                validado_por = ?,
                validado_em = CURRENT_TIMESTAMP,
                pontos_recebidos = 0,
                avisos_validacao = ?
            WHERE ID = ?
        `, [validado_por, avisos_validacao, id]);

        const entregaAtualizada = await db.get(
            'SELECT * FROM entregas WHERE ID = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Entrega rejeitada',
            entrega: entregaAtualizada
        });

    } catch (erro) {
        console.error('Erro ao rejeitar entrega:', erro);
        res.status(500).json({
            success: false,
            message: 'Erro ao rejeitar entrega'
        });
    }
});

/**
 * DELETE /entregas/:id
 * Exclui uma entrega (apenas pendentes, apenas para admin)
 */
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const db = await openDb();

        // Verifica se está pendente
        const entrega = await db.get(
            'SELECT * FROM entregas WHERE ID = ? AND status = ?',
            [id, 'pendente']
        );

        if (!entrega) {
            return res.status(404).json({
                success: false,
                message: 'Entrega não encontrada ou não pode ser excluída'
            });
        }

        // Exclui itens primeiro
        await db.run('DELETE FROM itens_entrega WHERE entrega_id = ?', [id]);

        // Exclui entrega
        await db.run('DELETE FROM entregas WHERE ID = ?', [id]);

        res.json({
            success: true,
            message: 'Entrega excluída com sucesso'
        });

    } catch (erro) {
        console.error('Erro ao excluir entrega:', erro);
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir entrega'
        });
    }
});

export default router;
