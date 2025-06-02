// src/controllers/devolucaoController.js
const db = require('../database/db'); // Importe a instância do banco de dados

const devolucaoController = {
    // Busca devoluções por ID do cliente
    getDevolucoesByClienteId: (req, res) => {
        const { idUsuario } = req.params;

        // Use um JOIN para pegar o nome do produto para cada item de devolução, se necessário
        // Por enquanto, vamos focar nas devoluções em si.
        // Se precisar dos itens e produtos, a consulta seria mais complexa.

        const sql = `
            SELECT
                D.idDevolucao,
                D.dataSolicitacao,
                D.status,
                D.mensagemResposta,
                U.nome AS nomeCliente
            FROM
                Devolucoes D
            JOIN
                Usuarios U ON D.idUsuarioCliente = U.idUsuario
            WHERE
                D.idUsuarioCliente = ?
            ORDER BY
                D.dataSolicitacao DESC;
        `;

        db.all(sql, [idUsuario], (err, rows) => {
            if (err) {
                console.error('Erro ao buscar devoluções do cliente:', err.message);
                return res.status(500).json({ message: 'Erro interno do servidor ao buscar devoluções.' });
            }
            res.status(200).json(rows);
        });
    },

    // Busca todas as devoluções (para o gestor)
    getAllDevolucoes: (req, res) => {
        const sql = `
            SELECT
                D.idDevolucao,
                D.dataSolicitacao,
                D.status,
                D.mensagemResposta,
                UC.nome AS nomeCliente,
                UG.nome AS nomeGestor
            FROM
                Devolucoes D
            JOIN
                Usuarios UC ON D.idUsuarioCliente = UC.idUsuario
            LEFT JOIN
                Usuarios UG ON D.idUsuarioGestor = UG.idUsuario
            ORDER BY
                D.dataSolicitacao DESC;
        `;

        db.all(sql, (err, rows) => {
            if (err) {
                console.error('Erro ao buscar todas as devoluções:', err.message);
                return res.status(500).json({ message: 'Erro interno do servidor ao buscar devoluções.' });
            }
            res.status(200).json(rows);
        });
    }
};

module.exports = devolucaoController;
