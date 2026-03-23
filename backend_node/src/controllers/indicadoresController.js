const indicadoresModel = require('../models/indicadoresModel');

const buscarIndicadores = async (req, res) => {
    try {
        const filtros = {
            estado: req.query.estado,
            anoInicial: req.query.anoInicial,
            serie: req.query.serie,
            apenasNacional: req.query.apenasNacional
        };

        const resultados = await indicadoresModel.getDadosFiltrados(filtros);
        
        return res.status(200).json({
            total_registros: resultados.length,
            dados: resultados
        });

    } catch (error) {
        console.error("Erro ao buscar indicadores:", error);
        return res.status(500).json({ erro: "Erro interno no servidor ao consultar o banco de dados." });
    }
};

module.exports = { buscarIndicadores };