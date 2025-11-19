import { Router } from "express";
import prisma from "../services/prismaClient";
import { hashPassword, comparePassword } from "../utils/hash";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

router.post("/register", async (req, res) => {
  const { nome, email, ra, senha, tipoUsuario, cursoId, campusId } = req.body;
  try {
    const senhaHash = await hashPassword(senha);
    const user = await prisma.usuarios.create({
      data: { nome, email, ra, senhaHash, tipoUsuario, cursoId, campusId }
    });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "dev_jwt_secret", { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, nome: user.nome, email: user.email }});
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const user = await prisma.usuarios.findUnique({ where: { email }});
    if (!user) return res.status(401).json({ message: "Credenciais inválidas" });
    const ok = await comparePassword(senha, user.senhaHash);
    if (!ok) return res.status(401).json({ message: "Credenciais inválidas" });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "dev_jwt_secret", { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, nome: user.nome, email: user.email }});
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

export default router;
