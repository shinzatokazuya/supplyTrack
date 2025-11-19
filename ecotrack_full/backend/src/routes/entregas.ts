import { Router } from "express";
import prisma from "../services/prismaClient";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);

// criar entrega
router.post("/", async (req, res) => {
  const userId = req.userId!;
  const { itens } = req.body; // itens: [{ tipoResiduoId, pesoEstimado }]
  try {
    const entrega = await prisma.entrega.create({
      data: {
        usuarioId: userId,
        status: "pendente",
        itens: { create: itens }
      },
      include: { itens: true }
    });
    res.json(entrega);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao criar entrega" });
  }
});

// listar entregas do usuário
router.get("/", async (req, res) => {
  const userId = req.userId!;
  const entregas = await prisma.entrega.findMany({
    where: { usuarioId: userId },
    include: { itens: true, usuario: true }
  });
  res.json(entregas);
});

// validação (apenas admin/validador)
router.post("/:id/validate", async (req, res) => {
  const validadorId = req.userId!;
  const entregaId = Number(req.params.id);
  const { status, pontosRecebidos, avisosValidacao } = req.body;
  try {
    const entrega = await prisma.entrega.update({
      where: { id: entregaId },
      data: {
        status,
        pontosRecebidos,
        validadoPorId: validadorId,
        validadoEm: new Date(),
        avisosValidacao
      }
    });
    // Atualiza pontuação do usuário se validado
    if (status === "validado" && pontosRecebidos) {
      await prisma.pontuacaoUsuario.upsert({
        where: { usuarioId: entrega.usuarioId },
        update: { pontosAcumulados: { increment: pontosRecebidos } as any },
        create: { usuarioId: entrega.usuarioId, pontosAcumulados: pontosRecebidos }
      });
    }
    res.json(entrega);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro na validação" });
  }
});

export default router;
