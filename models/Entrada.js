const Sequelize = require('sequelize');
const db = require('../config/db');
const uuid = require('uuid').v4;

const Invitado = require('./Invitado');
const Evento = require('./Evento');

const Entrada = db.define('entrada', {
    codigo:{
        type: Sequelize.STRING(60),
        primaryKey: true
    },
    hora_inicio:{
        type: Sequelize.TIME
    },
    asistencia: {
        type: Sequelize.BOOLEAN,
        defaultValue: true // Establecer el valor predeterminado como false
    },
    CIinvitado:{
        type: Sequelize.STRING(60),
    },
    codigo_evento: {
        type: Sequelize.STRING(60),
    },
}, {
    hooks: {
        beforeCreate: async (entrada) => {
            entrada.codigo = await Entrada.prototype.uuid();
        }
    }
});

Entrada.prototype.uuid = async function(){
    return uuid();
}

Entrada.belongsTo(Invitado, {
    foreignKey: 'CIinvitado',
    onDelete: 'CASCADE'
})

Entrada.belongsTo(Evento, {
    foreignKey: 'codigo_evento',
    onDelete: 'CASCADE'
})

module.exports = Entrada;