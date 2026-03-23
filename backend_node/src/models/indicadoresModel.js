const sqlite3 = require('sqlite3').verbose();
const { rejects } = require('assert');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../../database/credito_inclusivo.db');
const db = new sqlite3.Database(dbPath);

const getDadosFiltrados = (filtros) => {
    return new Promise((resolve, reject) => {
        let sqlQuery = `
            SELECT s.nome_indicador, s.categoria, f.sigla_uf, f.data_referencia, f.valor, s.unidade_medida
            FROM fact_serie_temporal f
            JOIN dim_serie s ON s.id_serie = f.id_serie
            WHERE 1=1
        `;
        let queryParams = [];

        if (filtros.estado){
            sqlQuery += ' AND f.sigla_uf = ?';
            queryParams.push(filtros.estado);
        } else if (filtros.apenasNacional === 'true') {
            sqlQuery += ' AND f.sigla_uf IS NULL';
        }

        if (filtros.anoInicial) {
            sqlQuery += ' AND f.data_referencia >= ?';
            queryParams.push(`${filtros.anoInicial}-01-01`);
        }

        if (filtros.serie) {
            sqlQuery += ' AND f.id_serie = ?';
            queryParams.push(filtros.serie);
        }

        sqlQuery += ' ORDER BY f.data_referencia ASC';
        db.all(sqlQuery, queryParams, (err, rows) => {
            if(err) {
                console.error("ERRO NO SQL:", err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

module.exports = { getDadosFiltrados };