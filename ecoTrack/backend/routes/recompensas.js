import { Router } from "express";
import { openDb } from "../db/connection.js";

const router = Router();

router.get("/", async (_, res) => {
    const db = await openDb();
    res.json(await db.all("SELECT * FROM recompensas"));
});

router.get("/:id", async (req, res) => {
    const db = await openDb();
    res.json(await db.get("SELECT * FROM recompensas WHERE ID=?", [req.params.id]));
});

router.post("/", async (req, res) => {
    const db = await openDb();
    const { nome, descricao, pontos_necessarios, tipo } = req.body;

    const r = await db.run(`
    INSERT INTO recompensas (nome,descricao,pontos_necessarios,tipo)
    VALUES (?,?,?,?)`,
        [nome, descricao, pontos_necessarios, tipo]
    );

    res.json({ ID: r.lastID });
});

router.put("/:id", async (req, res) => {
    const db = await openDb();
    const { nome, descricao, pontos_necessarios, tipo } = req.body;

    await db.run(
        `UPDATE recompensas
     SET nome=?, descricao=?, pontos_necessarios=?, tipo=?
     WHERE ID=?`,
        [nome, descricao, pontos_necessarios, tipo, req.params.id]
    );

    res.json({ message: "Atualizado" });
});

router.delete("/:id", async (req, res) => {
    const db = await openDb();
    await db.run("DELETE FROM recompensas WHERE ID=?", [req.params.id]);
    res.json({ message: "Removido" });
});

export default router;
