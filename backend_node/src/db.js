const { Sequelize } = require('sequelize');
const path = require('path');

// Configura a conexão com o SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database', 'banco.sqlite') // Aponta para a pasta que você criou
});

module.exports = sequelize;