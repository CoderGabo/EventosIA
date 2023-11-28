const Sequelize = require('sequelize');
const db = require('../config/db');

const persona = require('./Persona')

const Fotografo = db.define('fotografo',{
    CIpersona:{
        type: Sequelize.STRING(60),
        primaryKey: true
    },
    Experiencia:{
        type: Sequelize.TEXT()
    },
    Estrellas:{
        type: Sequelize.INTEGER()
    },
    empresa:{
        type: Sequelize.STRING(150)
    }
})

Fotografo.belongsTo(persona, 
    {
        foreignKey: 'CIpersona',
        onDelete: 'CASCADE'
    })

module.exports = Fotografo