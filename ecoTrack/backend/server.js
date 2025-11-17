/**
 * SERVIDOR PRINCIPAL DA API ECOTRACK
 *
 * Este arquivo configura e inicia o servidor Express que gerencia
 * todas as requisições HTTP da aplicação.
 */

import express from "express";
import cors from "cors";

// Importa todas as rotas da aplicação
import auth from "./routes/auth.js";
import usuarios from "./routes/usuarios.js";
import cursos from "./routes/cursos.js";
import campi from "./routes/campi.js";
import tipos_residuos from "./routes/tipos_residuos.js";
import entregas from "./routes/entregas.js";
import itens_entrega from "./routes/itens_entrega.js";
import recompensas from "./routes/recompensas.js";
import historico_recompensa from "./routes/historico_recompensa.js";
import medalhas from "./routes/medalhas.js";
import usuario_medalhas from "./routes/usuario_medalhas.js";

// Cria a aplicação Express
const app = express();

// ============================================
// MIDDLEWARES GLOBAIS
// ============================================

// CORS: Permite que o frontend (em outra porta) acesse a API
app.use(cors());

// Parser JSON: Permite que o Express entenda requisições com corpo JSON
app.use(express.json());

// Middleware para log de requisições (útil para debug)
app.use((req, res, next) => {
    const timestamp = new Date().toLocaleString('pt-BR');
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// ============================================
// REGISTRO DAS ROTAS
// ============================================

// Rota de autenticação (login e registro)
app.use("/auth", auth);

// Rotas de recursos do sistema
app.use("/usuarios", usuarios);
app.use("/cursos", cursos);
app.use("/campi", campi);
app.use("/tipos_residuos", tipos_residuos);
app.use("/entregas", entregas);
app.use("/itens_entrega", itens_entrega);
app.use("/recompensas", recompensas);
app.use("/historico_recompensa", historico_recompensa);
app.use("/medalhas", medalhas);
app.use("/usuario_medalhas", usuario_medalhas);

// ============================================
// ROTA DE HEALTH CHECK
// ============================================
// Esta rota é útil para verificar se o servidor está funcionando
app.get("/", (req, res) => {
    res.json({
        message: "API EcoTrack está funcionando!",
        version: "1.0.0",
        endpoints: {
            auth: "/auth/login (POST), /auth/register (POST)",
            usuarios: "/usuarios",
            cursos: "/cursos",
            campi: "/campi",
            tipos_residuos: "/tipos_residuos",
            entregas: "/entregas",
            itens_entrega: "/itens_entrega",
            recompensas: "/recompensas",
            historico_recompensa: "/historico_recompensa",
            medalhas: "/medalhas",
            usuario_medalhas: "/usuario_medalhas"
        }
    });
});

// ============================================
// ROTA 404 - NÃO ENCONTRADA
// ============================================
// Esta rota captura qualquer requisição que não corresponda às rotas acima
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Rota ${req.method} ${req.path} não encontrada`,
        availableRoutes: "Acesse GET / para ver as rotas disponíveis"
    });
});

// ============================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// ============================================
// Este middleware captura erros que ocorrem em qualquer rota
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log('\n🚀 ========================================');
    console.log('   SERVIDOR ECOTRACK INICIADO COM SUCESSO');
    console.log('   ========================================');
    console.log(`   🌐 API rodando em: http://localhost:${PORT}`);
    console.log(`   📚 Documentação: http://localhost:${PORT}/`);
    console.log('   ========================================\n');
});

// Tratamento de erros não capturados
process.on('uncaughtException', (erro) => {
    console.error('❌ Erro não capturado:', erro);
    process.exit(1);
});

process.on('unhandledRejection', (motivo, promessa) => {
    console.error('❌ Promise rejeitada não tratada:', motivo);
    process.exit(1);
});
