// src/database/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'SupplyTrack.db'); // Garante o caminho correto para o DB
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        db.serialize(() => {
            // Tabela Usuarios (já deve existir)
            db.run(`CREATE TABLE IF NOT EXISTS Usuarios (
                idUsuario INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                senha TEXT NOT NULL,
                tipoUsuario TEXT NOT NULL CHECK(tipoUsuario IN ('cliente', 'gestor'))
            );`);

            // Tabela Produtos
            db.run(`CREATE TABLE IF NOT EXISTS Produtos (
                idProduto INTEGER PRIMARY KEY AUTOINCREMENT,
                nomeProduto TEXT NOT NULL UNIQUE,
                descricao TEXT,
                preco REAL NOT NULL
            );`);

            // Tabela Devolucoes (Cabeçalho da solicitação)
            db.run(`CREATE TABLE IF NOT EXISTS Devolucoes (
                idDevolucao INTEGER PRIMARY KEY AUTOINCREMENT,
                idUsuarioCliente INTEGER NOT NULL,
                dataSolicitacao TEXT NOT NULL, -- YYYY-MM-DD HH:MM:SS
                status TEXT NOT NULL CHECK(status IN ('Pendente', 'Em Análise', 'Aprovada', 'Rejeitada')) DEFAULT 'Pendente',
                mensagemResposta TEXT,
                dataResposta TEXT, -- YYYY-MM-DD HH:MM:SS
                idUsuarioGestor INTEGER,
                FOREIGN KEY (idUsuarioCliente) REFERENCES Usuarios(idUsuario),
                FOREIGN KEY (idUsuarioGestor) REFERENCES Usuarios(idUsuario)
            );`);

            // Tabela DevolucaoItens (Itens detalhados de cada devolução)
            db.run(`CREATE TABLE IF NOT EXISTS DevolucaoItens (
                idItem INTEGER PRIMARY KEY AUTOINCREMENT,
                idDevolucao INTEGER NOT NULL,
                idProduto INTEGER NOT NULL,
                quantidade INTEGER NOT NULL,
                motivo TEXT NOT NULL,
                FOREIGN KEY (idDevolucao) REFERENCES Devolucoes(idDevolucao),
                FOREIGN KEY (idProduto) REFERENCES Produtos(idProduto)
            );`);

            // Opcional: Inserir alguns produtos de exemplo se a tabela estiver vazia
            db.get("SELECT COUNT(*) AS count FROM Produtos", (err, row) => {
                if (err) {
                    console.error("Erro ao verificar produtos:", err.message);
                    return;
                }
                if (row.count === 0) {
                    console.log("Inserindo produtos de exemplo...");
                    const stmt = db.prepare(`INSERT INTO Produtos (nomeProduto, descricao, preco) VALUES (?, ?, ?);`);
                    stmt.run('Nokia', 'Smartphone de última geração', 1110.00);
                    stmt.run('Laptop Dell', 'Notebook para trabalho e estudo', 2900.99);
                    stmt.run('Monitor LG', 'Monitor LED 24 polegadas', 800.00);
                    stmt.run('Teclado Mecânico Razer', 'Teclado gamer RGB', 509.99);
                    stmt.run('Mouse Ergonômico Logitech', 'Mouse sem fio confortável', 100.00);
                    stmt.finalize(() => {
                        console.log("Produtos de exemplo inseridos.");
                    });
                }
            });
        });
    }
});

module.exports = db;
