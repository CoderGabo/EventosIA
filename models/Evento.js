const Sequelize = require('sequelize');
const db = require('../config/db');

const Organizador = require('./Organizador');

const Evento = db.define('evento', {
    codigo:{
        type: Sequelize.STRING(60),
        primaryKey: true
    },
    nombre:{
        type: Sequelize.STRING(100)
    },
    descripcion:{
        type: Sequelize.TEXT()
    },
    publicidad:{
        type: Sequelize.STRING(25)
    },
    cantidad_invitados: {
        type: Sequelize.INTEGER(),
    },
    fecha: {
        type: Sequelize.DATE()
    },
    estado: {
        type: Sequelize.STRING(),
        defaultValue: 'Abierto'
    }
});

Evento.belongsTo(Organizador, {
    foreignKey: 'CIOrganizador',
    onDelete: 'CASCADE'
})

module.exports = Evento;