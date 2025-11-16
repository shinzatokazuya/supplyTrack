import { Router } from "express";
import { openDb } from "../db/connection.js";

const router = Router();

// LISTAR
router.get("/", async (req, res) => {
  const db = await openDb();
  const rows = await db.all("SELECT * FROM usuarios");
  res.json(rows);
});

// BUSCAR POR ID
router.get("/:id", async (req, res) => {
  const db = await openDb();
  const row = await db.get("SELECT * FROM usuarios WHERE ID=?", [req.params.id]);
  res.json(row);
});

// CRIAR
router.post("/", async (req, res) => {
  const db = await openDb();
  const { nome, email, ra, curso_id, campus_id, tipo_usuario, senha } = req.body;

  const sql = `
    INSERT INTO usuarios (nome, email, ra, curso_id, campus_id, tipo_usuario, senha)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const r = await db.run(sql, [nome, email, ra, curso_id, campus_id, tipo_usuario, senha]);
  res.json({ ID: r.lastID });
});

// ATUALIZAR
router.put("/:id", async (req, res) => {
  const db = await openDb();
  const { nome, email, ra, curso_id, campus_id, tipo_usuario, senha } = req.body;

  const sql = `
    UPDATE usuarios
    SET nome=?, email=?, ra=?, curso_id=?, campus_id=?, tipo_usuario=?, senha=?
    WHERE ID=?
  `;

  await db.run(sql, [nome, email, ra, curso_id, campus_id, tipo_usuario, senha, req.params.id]);
  res.json({ message: "Atualizado" });
});

// DELETAR
router.delete("/:id", async (req, res) => {
  const db = await openDb();
  await db.run("DELETE FROM usuarios WHERE ID=?", [req.params.id]);
  res.json({ message: "Removido" });
});

export default router;
