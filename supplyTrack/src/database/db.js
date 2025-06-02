// src/database/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '..', '..', 'SupplyTrack.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');

        // Use serialize para garantir que as tabelas sejam criadas em ordem
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS Usuarios (
                    idUsuario INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    senha TEXT NOT NULL,
                    tipoUsuario TEXT NOT NULL CHECK (tipoUsuario IN ('cliente', 'gestor'))
                );
            `, (err) => {
                if (err) console.error("Erro ao criar tabela Usuarios:", err.message);
                else console.log("Tabela Usuarios verificada/criada.");
            });

            db.run(`
                CREATE TABLE IF NOT EXISTS Produtos (
                    idProduto INTEGER PRIMARY KEY AUTOINCREMENT,
                    nomeProduto TEXT NOT NULL,
                    descricao TEXT
                );
            `, (err) => {
                if (err) console.error("Erro ao criar tabela Produtos:", err.message);
                else console.log("Tabela Produtos verificada/criada.");
            });

            db.run(`
                CREATE TABLE IF NOT EXISTS Devolucoes (
                    idDevolucao INTEGER PRIMARY KEY AUTOINCREMENT,
                    idUsuarioCliente INTEGER NOT NULL,
                    idUsuarioGestor INTEGER,
                    dataSolicitacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                    dataResposta DATETIME,
                    status TEXT DEFAULT 'Aguardando',
                    mensagemResposta TEXT,
                    FOREIGN KEY (idUsuarioCliente) REFERENCES Usuarios(idUsuario),
                    FOREIGN KEY (idUsuarioGestor) REFERENCES Usuarios(idUsuario)
                );
            `, (err) => {
                if (err) console.error("Erro ao criar tabela Devolucoes:", err.message);
                else console.log("Tabela Devolucoes verificada/criada.");
            });

            db.run(`
                CREATE TABLE IF NOT EXISTS ItensDevolucao (
                    idItemDevolucao INTEGER PRIMARY KEY AUTOINCREMENT,
                    idDevolucao INTEGER NOT NULL,
                    idProduto INTEGER NOT NULL,
                    quantidade INTEGER NOT NULL,
                    motivo TEXT,
                    FOREIGN KEY (idDevolucao) REFERENCES Devolucoes(idDevolucao),
                    FOREIGN KEY (idProduto) REFERENCES Produtos(idProduto)
                );
            `, (err) => {
                if (err) console.error("Erro ao criar tabela ItensDevolucao:", err.message);
                else console.log("Tabela ItensDevolucao verificada/criada.");
            });
        });
    }
});

process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Conexão com o banco de dados fechada.');
        process.exit(0);
    });
});

module.exports = db;
