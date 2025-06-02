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

    // Nova função: Registrar uma nova solicitação de devolução
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

    // A função getHistoricoDevolucoes também precisará ser ajustada se você quiser exibir nomeProduto e empresaFornecedora
    // Você terá que fazer um JOIN com DevolucaoItens para puxar esses detalhes se for exibir uma lista consolidada.
    // Para listar o histórico principal (sem detalhes de itens) ela já está OK.
    // Mas se for ver a devolução individualmente, precisará de uma nova rota/função para "detalhes da devolução".
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
    }
};

module.exports = devolucaoController;
