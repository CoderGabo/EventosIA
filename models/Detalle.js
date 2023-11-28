const Sequelize = require('sequelize');
const db = require('../config/db');
const uuid = require('uuid').v4;

const Detalle = db.define('detalle', {
    codigo:{
        type: Sequelize.STRING(60),
        primaryKey: true
    },
    listaFotografias: {
        type: Sequelize.ARRAY(Sequelize.STRING(60)),
    },
}, {
    hooks: {
        beforeCreate: async (detalle) => {
            detalle.codigo = await Detalle.prototype.uuid();
        }
    }
});

Detalle.prototype.uuid = async function(){
    return uuid();
}

module.exports = Detalle;