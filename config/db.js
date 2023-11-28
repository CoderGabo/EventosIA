const {Sequelize} = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    'FotosRekognition',
    'postgres',
    'Restaurante',
    {
        host: 'localhost',
        dialect: "postgres",
    }
);

module.exports = sequelize;