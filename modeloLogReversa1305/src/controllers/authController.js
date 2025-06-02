const db = require('../database/db');

exports.cadastrarUsuario = (req, res) => {
  const { nome, email, senha, tipoUsuario } = req.body;

  if (!nome || !email || !senha || !tipoUsuario) {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
  }

  const query = `INSERT INTO Usuarios (nome, email, senha, tipoUsuario) VALUES (?, ?, ?, ?)`;

  db.run(query, [nome, email, senha, tipoUsuario], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ mensagem: 'Erro ao cadastrar o usuário.' });
    }

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso.' });
  });
};
