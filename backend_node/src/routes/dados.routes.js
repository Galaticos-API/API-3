// src/routes/dados.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/dados.controller');

router.get('/dados', controller.getDados);

module.exports = router;