import { Router } from "express";
import { openDb } from "../db/connection.js";

const router = Router();

router.get("/", async (req, res) => {
    const db = await openDb();
    res.json(await db.all("SELECT * FROM itens_entrega"));
});

router.get("/:id", async (req, res) => {
    const db = await openDb();
    res.json(await db.get("SELECT * FROM itens_entrega WHERE ID=?", [req.params.id]));
});

router.post("/", async (req, res) => {
    const db = await openDb();
    const { entrega_id, tipo_residuo_id, peso_estimado, peso_atual } = req.body;

    const r = await db.run(
        "INSERT INTO itens_entrega (entrega_id,tipo_residuo_id,peso_estimado,peso_atual) VALUES (?,?,?,?)",
        [entrega_id, tipo_residuo_id, peso_estimado, peso_atual]
    );
    res.json({ ID: r.lastID });
});

router.put("/:id", async (req, res) => {
    const db = await openDb();
    const { entrega_id, tipo_residuo_id, peso_estimado, peso_atual } = req.body;

    await db.run(
        `UPDATE itens_entrega
     SET entrega_id=?, tipo_residuo_id=?, peso_estimado=?, peso_atual=?
     WHERE ID=?`,
        [entrega_id, tipo_residuo_id, peso_estimado, peso_atual, req.params.id]
    );
    res.json({ message: "Atualizado" });
});

router.delete("/:id", async (req, res) => {
    const db = await openDb();
    await db.run("DELETE FROM itens_entrega WHERE ID=?", [req.params.id]);
    res.json({ message: "Removido" });
});

export default router;
