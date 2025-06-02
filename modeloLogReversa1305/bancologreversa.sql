-- Tabela de usuários
CREATE TABLE Usuarios (
    idUsuario INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    tipoUsuario TEXT NOT NULL CHECK (tipoUsuario IN ('cliente', 'gestor'))
);

-- Tabela de produtos disponíveis para devolução
CREATE TABLE Produtos (
    idProduto INTEGER PRIMARY KEY AUTOINCREMENT,
    nomeProduto TEXT NOT NULL,
    descricao TEXT
);

-- Tabela de devoluções
CREATE TABLE Devolucoes (
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

-- Tabela de itens de cada devolução
CREATE TABLE ItensDevolucao (
    idItemDevolucao INTEGER PRIMARY KEY AUTOINCREMENT,
    idDevolucao INTEGER NOT NULL,
    idProduto INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    motivo TEXT,
    FOREIGN KEY (idDevolucao) REFERENCES Devolucoes(idDevolucao),
    FOREIGN KEY (idProduto) REFERENCES Produtos(idProduto)
);
