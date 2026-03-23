const express = require('express');
const router = express.Router();
const indicadoresController = require('../controllers/indicadoresController');

router.get('/', indicadoresController.buscarIndicadores);

module.exports = router;