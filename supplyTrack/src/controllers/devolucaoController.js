// src/controllers/devolucaoController.js
const db = require('../database/db');

const devolucaoController = {
    getDevolucaoById: (req, res) => {
        const { idDevolucao } = req.params;

        console.log('Backend: Recebida solicitação para devolução ID:', idDevolucao);

        if (!idDevolucao) {
            console.error('Backend: ID da devolução não fornecido.');
            return res.status(400).json({ message: 'ID da devolução é obrigatório.' });
        }

        // Consulta para pegar os detalhes da devolução principal e os dados do cliente
        const sqlDevolucao = `
            SELECT
                D.idDevolucao,
                D.dataSolicitacao,
                D.status,
                D.mensagemResposta,
                D.dataResposta,
                UC.nome AS nomeCliente,
                UC.email AS emailCliente,
                UG.nome AS nomeGestor
            FROM
                Devolucoes D
            JOIN
                Usuarios UC ON D.idUsuarioCliente = UC.idUsuario
            LEFT JOIN
                Usuarios UG ON D.idUsuarioGestor = UG.idUsuario
            WHERE
                D.idDevolucao = ?;
        `;

        // Consulta para pegar os itens específicos desta devolução
        const sqlItens = `
            SELECT
                nomeProduto,
                empresaFornecedora,
                quantidade,
                motivo
            FROM
                DevolucaoItens
            WHERE
                idDevolucao = ?;
        `;

        db.get(sqlDevolucao, [idDevolucao], (err, devolucao) => {
            if (err) {
                console.error('Backend: Erro ao buscar detalhes da devolução:', err.message);
                return res.status(500).json({ message: 'Erro interno do servidor ao buscar devolução.' });
            }
            if (!devolucao) {
                console.warn('Backend: Devolução não encontrada para o ID:', idDevolucao);
                return res.status(404).json({ message: 'Devolução não encontrada.' });
            }

            db.all(sqlItens, [idDevolucao], (err, itens) => {
                if (err) {
                    console.error('Backend: Erro ao buscar itens da devolução:', err.message);
                    return res.status(500).json({ message: 'Erro interno do servidor ao buscar itens da devolução.' });
                }

                // Retorna os detalhes da devolução e seus itens em um único objeto
                res.status(200).json({
                    ...devolucao,
                    itens: itens || [] // Garante que 'itens' seja um array, mesmo que vazio
                });
            });
        });
    },

    updateDevolucaoStatus: (req, res) => {
        const { idDevolucao } = req.params;
        const { status, mensagemResposta, idUsuarioGestor } = req.body; // idUsuarioGestor é o ID do gestor logado

        console.log('Backend: Recebida solicitação para atualizar devolução ID:', idDevolucao);
        console.log('  Status:', status, 'Mensagem:', mensagemResposta, 'Gestor ID:', idUsuarioGestor);

        if (!idDevolucao || !status || !mensagemResposta || !idUsuarioGestor) {
            console.error('Backend: Dados incompletos para atualização de devolução.');
            return res.status(400).json({ message: 'Todos os campos (status, mensagemResposta, idUsuarioGestor) são obrigatórios.' });
        }

        const dataResposta = new Date().toISOString(); // Data e hora da resposta

        const sql = `
            UPDATE Devolucoes
            SET
                status = ?,
                mensagemResposta = ?,
                dataResposta = ?,
                idUsuarioGestor = ?
            WHERE
                idDevolucao = ?;
        `;

        db.run(sql, [status, mensagemResposta, dataResposta, idUsuarioGestor, idDevolucao], function(err) {
            if (err) {
                console.error('Backend: Erro ao atualizar status da devolução:', err.message);
                return res.status(500).json({ message: 'Erro interno do servidor ao atualizar devolução.' });
            }
            if (this.changes === 0) {
                console.warn('Backend: Nenhuma devolução encontrada para o ID', idDevolucao, 'para atualizar.');
                return res.status(404).json({ message: 'Devolução não encontrada para atualização.' });
            }
            console.log('Backend: Devolução ID', idDevolucao, 'atualizada com sucesso.');
            res.status(200).json({ message: 'Devolução atualizada com sucesso.' });
        });
    }
};

module.exports = devolucaoController;
