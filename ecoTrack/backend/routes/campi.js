import { Router } from "express";
import { openDb } from "../db/connection.js";

const router = Router();

router.get("/", async (req, res) => {
  const db = await openDb();
  res.json(await db.all("SELECT * FROM campi"));
});

router.get("/:id", async (req, res) => {
  const db = await openDb();
  res.json(await db.get("SELECT * FROM campi WHERE ID=?", [req.params.id]));
});

router.post("/", async (req, res) => {
  const db = await openDb();
  const { nome, cidade, estado, uf } = req.body;
  const r = await db.run("INSERT INTO campi (nome,cidade,estado,uf) VALUES (?,?,?,?)", [nome, cidade, estado, uf]);
  res.json({ ID: r.lastID });
});

router.put("/:id", async (req, res) => {
  const db = await openDb();
  const { nome, cidade, estado, uf } = req.body;
  await db.run("UPDATE campi SET nome=?, cidade=?, estado=?, uf=? WHERE ID=?", [
    nome, cidade, estado, uf, req.params.id
  ]);
  res.json({ message: "Atualizado" });
});

router.delete("/:id", async (req, res) => {
  const db = await openDb();
  await db.run("DELETE FROM campi WHERE ID=?", [req.params.id]);
  res.json({ message: "Removido" });
});

export default router;
