const Sequelize = require('sequelize');
const db = require('../config/db');
const uuid = require('uuid').v4;

const Fotografo = require('./Fotografo');
const Evento = require('./Evento');

const Invitacion = db.define('invitacion', {
    codigo:{
        type: Sequelize.STRING(60),
        primaryKey: true
    },
    hora_inicio:{
        type: Sequelize.TIME
    },
    asistencia:{
        type: Sequelize.BOOLEAN,
        defaultValue: true // Establecer el valor predeterminado como false
    },
    CIfotografo:{
        type: Sequelize.STRING(60)
    },
    codigo_evento: {
        type: Sequelize.STRING(60),
    },
}, {
    hooks: {
        beforeCreate: async (invitacion) => {
            invitacion.codigo = await Invitacion.prototype.uuid();
        }
    }
});

Invitacion.prototype.uuid = async function(){
    return uuid();
}

Invitacion.belongsTo(Fotografo, {
    foreignKey: 'CIfotografo',
    onDelete: 'CASCADE'
})

Invitacion.belongsTo(Evento, {
    foreignKey: 'codigo_evento',
    onDelete: 'CASCADE'
})

module.exports = Invitacion;