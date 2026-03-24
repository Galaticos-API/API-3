// src/controllers/dados.controller.js
const db = require('../database/db');

exports.getDados = (req, res) => {
  const {
    estado,
    anoInicial,
    anoFinal,
    instituicao,
    modalidade
  } = req.query;

  let query = "SELECT * FROM dados WHERE 1=1";
  let params = [];

  if (estado) {
    query += " AND estado = ?";
    params.push(estado);
  }

  if (anoInicial) {
    query += " AND ano >= ?";
    params.push(anoInicial);
  }

  if (anoFinal) {
    query += " AND ano <= ?";
    params.push(anoFinal);
  }

  if (instituicao) {
    query += " AND instituicao = ?";
    params.push(instituicao);
  }

  if (modalidade) {
    query += " AND modalidade = ?";
    params.push(modalidade);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: "Erro ao buscar dados" });
    }

    res.json(rows);
  });
};