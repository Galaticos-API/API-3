require('dotenv').config();
const sequelize = require('./db');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;

// Força o Sequelize a criar o arquivo e as tabelas
sequelize.sync().then(() => {
    console.log('✅ Banco de dados conectado e arquivo criado com sucesso!');
}).catch((erro) => {
    console.log('❌ Erro ao conectar ao banco:', erro);
});


app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});