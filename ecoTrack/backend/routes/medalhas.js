import { Router } from "express";
import { openDb } from "../db/connection.js";

const router = Router();

router.get("/", async (_, res) => {
    const db = await openDb();
    res.json(await db.all("SELECT * FROM medalhas"));
});

router.get("/:id", async (req, res) => {
    const db = await openDb();
    res.json(await db.get("SELECT * FROM medalhas WHERE ID=?", [req.params.id]));
});

router.post("/", async (req, res) => {
    const db = await openDb();
    const { nome, descricao, icone } = req.body;

    const r = await db.run(
        "INSERT INTO medalhas (nome,descricao,icone) VALUES (?,?,?)",
        [nome, descricao, icone]
    );

    res.json({ ID: r.lastID });
});

router.put("/:id", async (req, res) => {
    const db = await openDb();
    const { nome, descricao, icone } = req.body;

    await db.run(
        "UPDATE medalhas SET nome=?, descricao=?, icone=? WHERE ID=?",
        [nome, descricao, icone, req.params.id]
    );

    res.json({ message: "Atualizado" });
});

router.delete("/:id", async (req, res) => {
    const db = await openDb();
    await db.run("DELETE FROM medalhas WHERE ID=?", [req.params.id]);
    res.json({ message: "Removido" });
});

export default router;
