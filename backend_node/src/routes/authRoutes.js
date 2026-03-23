const express = require('express');
const { login, register } = require('../controllers/authController');
const { verificarToken } = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Exemplo de rota protegida
router.get('/perfil', verificarToken, (req, res) => {
    res.json({ mensagem: 'Acesso permitido', usuarioId: req.usuarioId });
});

module.exports = router;