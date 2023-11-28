const Sequelize = require('sequelize');
require('dotenv').config({path: 'variables.env'});

module.exports = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: "postgres",
        timezone: process.env.DB_TZ,
        dialectOptions: {
        ssl: {
            require: true,
        },
        },

    }
)