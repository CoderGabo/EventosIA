const Sequelize = require('sequelize');
const db = require('../config/db');

const persona = require('./Persona')

const Organizador = db.define('organizador',{
    CIpersona:{
        type: Sequelize.STRING(60),
        primaryKey: true
    },
    empresa:{
        type: Sequelize.STRING(150)
    }
})

Organizador.belongsTo(persona, 
    {
        foreignKey: 'CIpersona',
        onDelete: 'CASCADE',
        })

module.exports = Organizador