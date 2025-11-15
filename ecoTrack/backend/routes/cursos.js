import { Router } from "express";
import { openDb } from "../db/connection.js";

const router = Router();

router.get("/", async (req, res) => {
  const db = await openDb();
  res.json(await db.all("SELECT * FROM cursos"));
});

router.get("/:id", async (req, res) => {
  const db = await openDb();
  res.json(await db.get("SELECT * FROM cursos WHERE ID=?", [req.params.id]));
});

router.post("/", async (req, res) => {
  const db = await openDb();
  const { nome, sigla } = req.body;
  const r = await db.run("INSERT INTO cursos (nome, sigla) VALUES (?,?)", [nome, sigla]);
  res.json({ ID: r.lastID });
});

router.put("/:id", async (req, res) => {
  const db = await openDb();
  const { nome, sigla } = req.body;
  await db.run("UPDATE cursos SET nome=?, sigla=? WHERE ID=?", [nome, sigla, req.params.id]);
  res.json({ message: "Atualizado" });
});

router.delete("/:id", async (req, res) => {
  const db = await openDb();
  await db.run("DELETE FROM cursos WHERE ID=?", [req.params.id]);
  res.json({ message: "Removido" });
});

export default router;
