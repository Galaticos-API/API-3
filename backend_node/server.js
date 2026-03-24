// server.js
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const dadosRoutes = require('./src/routes/dados.routes');

app.use('/api', dadosRoutes);

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});