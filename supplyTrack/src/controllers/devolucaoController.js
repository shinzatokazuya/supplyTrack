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

        if (!idCliente || !itens || !Array.isArray(itens) || itens.length === 0) {
            return res.status(400).json({ sucesso: false, message: 'Dados da solicitação inválidos ou itens ausentes.' });
        }

        db.serialize(() => {
            db.run("BEGIN TRANSACTION;"); // Inicia uma transação

            const dataSolicitacao = new Date().toISOString(); // Data e hora atual

            // 1. Inserir na tabela Devolucoes
            db.run(
                `INSERT INTO Devolucoes (idUsuarioCliente, dataSolicitacao, status) VALUES (?, ?, ?);`,
                [idCliente, dataSolicitacao, 'Pendente'],
                function(err) {
                    if (err) {
                        console.error('Erro ao inserir nova devolução:', err.message);
                        db.run("ROLLBACK;"); // Reverte a transação em caso de erro
                        return res.status(500).json({ sucesso: false, message: 'Erro ao criar solicitação de devolução.' });
                    }

                    const idDevolucao = this.lastID; // Pega o ID da devolução recém-criada

                    // 2. Inserir na tabela DevolucaoItens para cada item
                    const stmt = db.prepare(`INSERT INTO DevolucaoItens (idDevolucao, idProduto, quantidade, motivo) VALUES (?, ?, ?);`);
                    let hasError = false;
                    itens.forEach(item => {
                        if (!hasError) { // Só executa se não houver erro anterior
                            stmt.run(idDevolucao, item.idProduto, item.quantidade, item.motivo, function(itemErr) {
                                if (itemErr) {
                                    console.error('Erro ao inserir item de devolução:', itemErr.message);
                                    hasError = true; // Marca que houve um erro
                                }
                            });
                        }
                    });

                    stmt.finalize(() => {
                        if (hasError) {
                            db.run("ROLLBACK;"); // Reverte se algum item falhou
                            return res.status(500).json({ sucesso: false, message: 'Erro ao adicionar itens da devolução.' });
                        } else {
                            db.run("COMMIT;"); // Confirma a transação
                            res.status(201).json({ sucesso: true, message: 'Solicitação de devolução criada com sucesso!', idDevolucao: idDevolucao });
                        }
                    });
                }
            );
        });
    },

    // Nova função: Listar o histórico completo de devoluções (para gestor/admin)
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
