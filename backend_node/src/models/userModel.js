// Este arquivo é um mock (simulação).
// Precisará ser substituído pela conexão real com o seu banco de dados.

const usuariosSimulados = []; // Banco de dados em memória para teste

const encontrarPorEmail = async (email) => {
    return usuariosSimulados.find(user => user.email === email);
};

const criarUsuario = async (email, senhaHash) => {
    const novoUsuario = { id: Date.now(), email, senha: senhaHash };
    usuariosSimulados.push(novoUsuario);
    return { id: novoUsuario.id, email: novoUsuario.email };
};

module.exports = { encontrarPorEmail, criarUsuario };