// src/controllers/devolucaoController.js
const db = require('../database/db');

const devolucaoController = {
    // Busca devoluções por ID do cliente (Já existente, mas revise se as colunas estão OK)
    getDevolucoesByClienteId: (req, res) => {
        const { idUsuario } = req.params;

        const sql = `
            SELECT
                D.idDevolucao,
                D.dataSolicitacao,
                D.status,
                D.mensagemResposta,
                D.dataResposta, -- Adicionado para histórico
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

    // Busca todas as devoluções (para o gestor) (Já existente)
    getAllDevolucoes: (req, res) => {
        const sql = `
            SELECT
                D.idDevolucao,
                D.dataSolicitacao,
                D.status,
                D.mensagemResposta,
                D.dataResposta, -- Adicionado para histórico
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
    },

    createNewDevolucao: (req, res) => {
        const { idCliente, itens } = req.body;

        console.log('Backend: Recebida solicitação de nova devolução.');
        console.log('Backend: idCliente:', idCliente);
        console.log('Backend: Itens:', itens);

        if (!idCliente || !itens || !Array.isArray(itens) || itens.length === 0) {
            console.error('Backend: Erro de validação: Dados da solicitação inválidos ou itens ausentes.');
            return res.status(400).json({ sucesso: false, message: 'Dados da solicitação inválidos ou itens ausentes.' });
        }

        // Validação adicional para cada item (opcional, mas recomendado)
        const itensInvalidos = itens.filter(item =>
            !item.nomeProduto || item.nomeProduto.trim() === '' ||
            !item.empresaFornecedora || item.empresaFornecedora.trim() === '' ||
            isNaN(item.quantidade) || item.quantidade <= 0 ||
            !item.motivo || item.motivo.trim() === ''
        );

        if (itensInvalidos.length > 0) {
            console.error('Backend: Erro de validação: Itens da solicitação contêm dados incompletos ou inválidos.');
            return res.status(400).json({ sucesso: false, message: 'Alguns itens da solicitação estão incompletos ou inválidos.' });
        }


        db.serialize(() => {
            db.run("BEGIN TRANSACTION;", (err) => {
                if (err) {
                    console.error('Backend: Erro ao iniciar transação:', err.message);
                    return res.status(500).json({ sucesso: false, message: 'Erro interno do servidor.' });
                }
            });

            const dataSolicitacao = new Date().toISOString();

            db.run(
                `INSERT INTO Devolucoes (idUsuarioCliente, dataSolicitacao, status) VALUES (?, ?, ?);`,
                [idCliente, dataSolicitacao, 'Pendente'],
                function(err) {
                    if (err) {
                        console.error('Backend: Erro ao inserir nova devolução no DB:', err.message);
                        db.run("ROLLBACK;");
                        return res.status(500).json({ sucesso: false, message: 'Erro ao criar solicitação de devolução.' });
                    }

                    const idDevolucao = this.lastID;
                    console.log('Backend: Devolução criada com ID:', idDevolucao);

                    // Ajuste aqui para inserir nomeProduto e empresaFornecedora
                    const stmt = db.prepare(`INSERT INTO DevolucaoItens (idDevolucao, nomeProduto, empresaFornecedora, quantidade, motivo) VALUES (?, ?, ?, ?, ?);`);
                    let hasError = false;
                    let itemsProcessed = 0;

                    itens.forEach(item => {
                        stmt.run(idDevolucao, item.nomeProduto, item.empresaFornecedora, item.quantidade, item.motivo, function(itemErr) {
                            itemsProcessed++;
                            if (itemErr) {
                                console.error('Backend: Erro ao inserir item de devolução:', itemErr.message);
                                hasError = true;
                            }

                            if (itemsProcessed === itens.length) {
                                stmt.finalize(() => {
                                    if (hasError) {
                                        db.run("ROLLBACK;", (rollbackErr) => {
                                            if (rollbackErr) console.error('Backend: Erro ao fazer rollback:', rollbackErr.message);
                                            return res.status(500).json({ sucesso: false, message: 'Erro ao adicionar itens da devolução. Transação revertida.' });
                                        });
                                    } else {
                                        db.run("COMMIT;", (commitErr) => {
                                            if (commitErr) console.error('Backend: Erro ao fazer commit:', commitErr.message);
                                            console.log('Backend: Solicitação de devolução e itens salvos com sucesso.');
                                            res.status(201).json({ sucesso: true, message: 'Solicitação de devolução criada com sucesso!', idDevolucao: idDevolucao });
                                        });
                                    }
                                });
                            }
                        });
                    });
                }
            );
        });
    },

    getHistoricoDevolucoes: (req, res) => {
        const sql = `
            SELECT
                D.idDevolucao,
                UC.nome AS nomeCliente,
                D.dataSolicitacao,
                D.dataResposta,
                D.status,
                D.mensagemResposta,
                UG.nome AS nomeGestorResponsavel
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
                console.error('Erro ao buscar histórico de devoluções:', err.message);
                return res.status(500).json({ message: 'Erro interno do servidor ao buscar histórico.' });
            }
            res.status(200).json(rows);
        });

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
}

module.exports = devolucaoController;
