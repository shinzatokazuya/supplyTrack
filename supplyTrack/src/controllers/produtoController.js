// src/controllers/produtoController.js
const db = require('../database/db');

const produtoController = {
    getAllProdutos: (req, res) => {
        const sql = `SELECT idProduto, nomeProduto FROM Produtos ORDER BY nomeProduto;`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error('Erro ao buscar produtos:', err.message);
                return res.status(500).json({ message: 'Erro interno do servidor ao buscar produtos.' });
            }
            res.status(200).json(rows);
        });
    }
};

module.exports = produtoController;
