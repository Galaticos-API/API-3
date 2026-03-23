const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

const register = async (req, res) => {
    const { email, senha } = req.body;
    try {
        // Lógica de registro (fictícia até conectar o BD)
        const usuarioExistente = await userModel.encontrarPorEmail(email);
        if (usuarioExistente) {
            return res.status(400).json({ erro: 'Usuário já existe' });
        }

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const novoUsuario = await userModel.criarUsuario(email, senhaHash);
        res.status(201).json({ mensagem: 'Usuário criado com sucesso', usuario: novoUsuario });
    } catch (error) {
        res.status(500).json({ erro: 'Erro no servidor' });
    }
};

const login = async (req, res) => {
    const { email, senha } = req.body;
    try {
        const usuario = await userModel.encontrarPorEmail(email);
        if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) return res.status(401).json({ erro: 'Credenciais inválidas' });

        const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ erro: 'Erro no servidor' });
    }
};

module.exports = { register, login };