const db = require('../database/db'); // Importe a conexão com o SQLite

// Função auxiliar para executar queries que retornam múltiplas linhas
function runQueryAll(sql, params) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Função auxiliar para executar queries que retornam uma única linha
function runQueryGet(sql, params) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// Função auxiliar para executar INSERT/UPDATE/DELETE
function runQueryRun(sql, params) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) { // Usamos 'function' para ter acesso ao 'this' (lastID, changes)
            if (err) {
                reject(err);
            } else {
                resolve(this); // Retorna informações como lastID (para inserts) e changes (para updates/deletes)
            }
        });
    });
}


async function listarDevolucoesCliente(req, res) {
    const { idCliente } = req.params;
    console.log("listarDevolucoesCliente: ID do cliente recebido:", idCliente); // Log
    // ...
    try {
        const result = await runQueryAll(`
            SELECT d.idDevolucao, d.dataSolicitacao, d.status
            FROM Devolucoes d
            WHERE d.idUsuarioCliente = ?
            ORDER BY d.dataSolicitacao DESC
        `, [idCliente]);
        console.log("listarDevolucoesCliente: Devoluções encontradas:", result.length); // Log
        res.json(result);
    } catch (err) {
        console.error('ERRO INTERNO NO SERVIDOR ao listar devoluções:', err.message); // Log mais específico
        res.status(500).send('Erro interno no servidor');
    }
}

async function verRespostaDevolucao(req, res) {
    const { id } = req.params;

    try {
        const cabecalho = await runQueryGet(`
            SELECT d.dataSolicitacao, d.status, d.mensagemResposta
            FROM Devolucoes d
            WHERE d.idDevolucao = ?
        `, [id]);

        if (!cabecalho) { // Se não encontrou cabeçalho, devolucao não existe
            return res.status(404).send('Devolução não encontrada.');
        }

        const itens = await runQueryAll(`
            SELECT p.nomeProduto, i.quantidade, i.motivo
            FROM ItensDevolucao i
            JOIN Produtos p ON p.idProduto = i.idProduto
            WHERE i.idDevolucao = ?
        `, [id]);

        res.json({
            ...cabecalho, // Já é um objeto, não precisa de recordset[0]
            itens: itens
        });

    } catch (err) {
        console.error('Erro ao buscar resposta da devolução:', err.message);
        res.status(500).send('Erro interno ao buscar resposta');
    }
}

async function listarProdutos(req, res) {
    try {
        const result = await runQueryAll('SELECT idProduto, nomeProduto FROM Produtos ORDER BY nomeProduto');

        res.json(result);
    } catch (err) {
        console.error('Erro ao buscar produtos:', err.message);
        res.status(500).send('Erro ao buscar produtos');
    }
}

async function criarNovaDevolucao(req, res) {
    const { idCliente, itens } = req.body;

    if (!idCliente) {
        return res.status(400).send('ID do cliente não fornecido.');
    }

    if (!Array.isArray(itens) || itens.length === 0) {
        return res.status(400).send('Nenhum item enviado para devolução.');
    }

    // Usando transações manuais para SQLite3
    try {
        await runQueryRun('BEGIN TRANSACTION');

        const devolucaoResult = await runQueryRun(`
            INSERT INTO Devolucoes (idUsuarioCliente, status, dataSolicitacao)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        `, [idCliente, 'Aguardando']);

        const idDevolucao = devolucaoResult.lastID; // Obter o ID da devolução recém-criada

        for (const item of itens) {
            await runQueryRun(`
                INSERT INTO ItensDevolucao (idDevolucao, idProduto, quantidade, motivo)
                VALUES (?, ?, ?, ?)
            `, [idDevolucao, item.idProduto, item.quantidade, item.motivo]);
        }

        await runQueryRun('COMMIT');

        res.json({ sucesso: true, idDevolucao });
    } catch (err) {
        await runQueryRun('ROLLBACK'); // Em caso de erro, rollback
        console.error('Erro ao criar nova devolução:', err.message);
        res.status(500).send('Erro ao criar devolução');
    }
}

module.exports = {
    listarDevolucoesCliente,
    criarNovaDevolucao,
    listarProdutos,
    verRespostaDevolucao
};
