const Sequelize = require('sequelize');
const db = require('../config/db');

const Persona = db.define('persona', {
    ci:{
        type: Sequelize.STRING(8),
        primaryKey: true
    },
    nombre:{
        type: Sequelize.STRING(100)
    },
    domicilio:{
        type: Sequelize.STRING(150)
    },
    telefono:{
        type: Sequelize.INTEGER(),
        unique: {
            args: true,
            msg: 'Numero de telefono ya registrado'
        },
    },
    email: {
        type: Sequelize.STRING(60),
        unique: {
            args: true,
            msg: 'Este correo ya esta registrado'
        },
        lowercase: true,
    },
    password: {
        type: Sequelize.STRING()
    },
    edad: {
        type: Sequelize.INTEGER(),
    }
})

module.exports = Persona;