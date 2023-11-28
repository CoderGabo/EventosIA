const Sequelize = require('sequelize');
const db = require('../config/db');

const persona = require('./Persona')

const Invitado = db.define('invitado',{
    CIpersona:{
        type: Sequelize.STRING(60),
        primaryKey: true
    },
    fotografia:{
        type: Sequelize.STRING(200)
    }
})

Invitado.belongsTo(persona, 
    {
        foreignKey: 'CIpersona',onDelete: 'CASCADE',
    })

module.exports = Invitado