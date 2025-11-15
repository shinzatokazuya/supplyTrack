import express from "express";
import cors from "cors";

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

const app = express();
app.use(cors());
app.use(express.json());

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

app.listen(3001, () => {
  console.log("API rodando em http://localhost:3001");
});
