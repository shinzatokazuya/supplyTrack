const db = require('../database/db'); // Importe a conexão com o SQLite

// Funções auxiliares (redefinidas para evitar dependência do mssql.sql)
// Você pode reutilizar as mesmas funções runQueryAll, runQueryGet, runQueryRun
// definidas no clienteController.js ou criar um arquivo de utilidades para elas.
// Para simplificar, vou incluí-las aqui novamente.
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

function runQueryRun(sql, params) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this);
            }
        });
    });
}

async function listarTodasDevolucoes(req, res) {
    console.log('➡️ Rota /api/gestor/devolucoes acessada');
    try {
        const result = await runQueryAll(`
            SELECT d.idDevolucao, u.nome AS nomeCliente, d.dataSolicitacao, d.status
            FROM Devolucoes d
            JOIN Usuarios u ON u.idUsuario = d.idUsuarioCliente
            ORDER BY d.dataSolicitacao DESC
        `);

        console.log('✅ Devoluções retornadas:', result.length);
        res.json(result);
    } catch (err) {
        console.error('❌ Erro ao listar todas as devoluções:', err.message);
        res.status(500).send('Erro ao buscar devoluções');
    }
}

async function responderDevolucao(req, res) {
    const { idDevolucao, idGestor, mensagemResposta } = req.body;

    if (!idDevolucao || !idGestor || !mensagemResposta) {
        return res.status(400).send('Dados incompletos.');
    }

    try {
        await runQueryRun(`
            UPDATE Devolucoes
            SET idUsuarioGestor = ?,
                mensagemResposta = ?,
                dataResposta = CURRENT_TIMESTAMP, -- Usar CURRENT_TIMESTAMP para SQLite
                status = 'Respondido'
            WHERE idDevolucao = ?
        `, [idGestor, mensagemResposta, idDevolucao]); // Ordem dos parâmetros deve corresponder aos '?'

        res.json({ sucesso: true });
    } catch (err) {
        console.error('Erro ao responder devolução:', err.message);
        res.status(500).send('Erro ao responder devolução');
    }
}

async function listarItensDevolucao(req, res) {
    const { id } = req.params;

    try {
        const result = await runQueryAll(`
            SELECT p.nomeProduto, i.quantidade, i.motivo
            FROM ItensDevolucao i
            JOIN Produtos p ON p.idProduto = i.idProduto
            WHERE i.idDevolucao = ?
        `, [id]);

        res.json(result);
    } catch (err) {
        console.error('Erro ao buscar itens da devolução:', err.message);
        res.status(500).send('Erro ao buscar itens da devolução');
    }
}

module.exports = {
    listarTodasDevolucoes,
    responderDevolucao,
    listarItensDevolucao
};
