const Sequelize = require('sequelize');
const db = require('../config/db');

const Evento = require('./Evento');
const Fotografo = require('./Fotografo');

const Fotografia = db.define('fotografia', {
    id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    foto:{
        type: Sequelize.STRING(200)
    },
    listaInvitados: {
        type: Sequelize.ARRAY(Sequelize.STRING(60)),
    },
    precios: {
        type: Sequelize.INTEGER(),
    },
    CIfotografo:{
        type: Sequelize.STRING(60),
    },
    codigo_evento: {
        type: Sequelize.STRING(60),
    },
});

Fotografia.belongsTo(Fotografo, {
    foreignKey: 'CIfotografo',
    onDelete: 'CASCADE'
})

Fotografia.belongsTo(Evento, {
    foreignKey: 'codigo_evento',
    onDelete: 'CASCADE'
})

module.exports = Fotografia;