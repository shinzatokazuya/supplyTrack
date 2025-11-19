/**
 * ROTAS DE CAMPUS
 *
 * Gerencia a listagem e manipulação de campus
 */

import { Router } from "express";
import { openDb } from "../db/connection.js";

const router = Router();

/**
 * GET /campi
 * Lista todos os campus
 */
router.get("/", async (req, res) => {
    try {
        const db = await openDb();
        const campi = await db.all('SELECT * FROM campi ORDER BY nome');
        res.json(campi);
    } catch (erro) {
        console.error('Erro ao listar campi:', erro);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar campus'
        });
    }
});

/**
 * GET /campi/:id
 * Busca um campus específico por ID
 */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const db = await openDb();

        const campus = await db.get('SELECT * FROM campi WHERE ID = ?', [id]);

        if (!campus) {
            return res.status(404).json({
                success: false,
                message: 'Campus não encontrado'
            });
        }

        res.json(campus);
    } catch (erro) {
        console.error('Erro ao buscar campus:', erro);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar campus'
        });
    }
});

export default router;
