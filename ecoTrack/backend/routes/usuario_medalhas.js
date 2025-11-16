import { Router } from "express";
import { openDb } from "../db/connection.js";

const router = Router();

router.get("/", async (_, res) => {
    const db = await openDb();
    res.json(await db.all("SELECT * FROM usuario_medalhas"));
});

router.get("/:id", async (req, res) => {
    const db = await openDb();
    res.json(await db.get("SELECT * FROM usuario_medalhas WHERE ID=?", [req.params.id]));
});

router.post("/", async (req, res) => {
    const db = await openDb();
    const { usuario_id, medalha_id } = req.body;

    const r = await db.run(
        "INSERT INTO usuario_medalhas (usuario_id,medalha_id) VALUES (?,?)",
        [usuario_id, medalha_id]
    );

    res.json({ ID: r.lastID });
});

router.delete("/:id", async (req, res) => {
    const db = await openDb();
    await db.run("DELETE FROM usuario_medalhas WHERE ID=?", [req.params.id]);
    res.json({ message: "Removido" });
});

export default router;
