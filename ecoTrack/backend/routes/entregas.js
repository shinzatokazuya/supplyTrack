import { Router } from "express";
import { openDb } from "../db/connection.js";

const router = Router();

router.get("/", async (req, res) => {
    const db = await openDb();
    res.json(await db.all("SELECT * FROM entregas"));
});

router.get("/:id", async (req, res) => {
    const db = await openDb();
    res.json(await db.get("SELECT * FROM entregas WHERE ID=?", [req.params.id]));
});

router.post("/", async (req, res) => {
    const db = await openDb();
    const { usuario_id, avisos, pontos_esperados } = req.body;
    const r = await db.run(
        "INSERT INTO entregas (usuario_id, avisos, pontos_esperados) VALUES (?,?,?)",
        [usuario_id, avisos, pontos_esperados]
    );
    res.json({ ID: r.lastID });
});

router.put("/:id", async (req, res) => {
    const db = await openDb();
    const { usuario_id, avisos, pontos_esperados, status, pontos_recebidos, validado_por, validado_em } = req.body;

    await db.run(
        `UPDATE entregas SET
      usuario_id=?, avisos=?, pontos_esperados=?, status=?,
      pontos_recebidos=?, validado_por=?, validado_em=?
      WHERE ID=?`,
        [
            usuario_id, avisos, pontos_esperados, status,
            pontos_recebidos, validado_por, validado_em,
            req.params.id
        ]
    );

    res.json({ message: "Atualizado" });
});

router.delete("/:id", async (req, res) => {
    const db = await openDb();
    await db.run("DELETE FROM entregas WHERE ID=?", [req.params.id]);
    res.json({ message: "Removido" });
});

export default router;
