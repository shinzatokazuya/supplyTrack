import { Router } from "express";
import { openDb } from "../db/connection.js";

const router = Router();

router.get("/", async (req, res) => {
  const db = await openDb();
  res.json(await db.all("SELECT * FROM tipos_residuos"));
});

router.get("/:id", async (req, res) => {
  const db = await openDb();
  res.json(await db.get("SELECT * FROM tipos_residuos WHERE ID=?", [req.params.id]));
});

router.post("/", async (req, res) => {
  const db = await openDb();
  const { nome, descricao, pontos, cor } = req.body;
  const r = await db.run(
    "INSERT INTO tipos_residuos (nome,descricao,pontos,cor) VALUES (?,?,?,?)",
    [nome, descricao, pontos, cor]
  );
  res.json({ ID: r.lastID });
});

router.put("/:id", async (req, res) => {
  const db = await openDb();
  const { nome, descricao, pontos, cor } = req.body;
  await db.run(
    "UPDATE tipos_residuos SET nome=?, descricao=?, pontos=?, cor=? WHERE ID=?",
    [nome, descricao, pontos, cor, req.params.id]
  );
  res.json({ message: "Atualizado" });
});

router.delete("/:id", async (req, res) => {
  const db = await openDb();
  await db.run("DELETE FROM tipos_residuos WHERE ID=?", [req.params.id]);
  res.json({ message: "Removido" });
});

export default router;
