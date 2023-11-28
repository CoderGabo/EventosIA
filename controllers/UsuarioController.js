const Persona = require('../models/Persona');
const Invitado = require('../models/Invitado');
const Organizador = require('../models/Organizador');
const Fotografo = require('../models/Fotografo');

const bcrypt = require('bcrypt');

exports.Login = async(req, res, next) => {
    const {usuario, password} = req.body;

    const persona = await Persona.findOne({
        where: {
            nombre: usuario,
        }
    });

    if(persona === null){
        res.json({mensaje: 'Datos no validos'})
        return;
    }

    const ci = persona.ci;
    const invitado = await Invitado.findOne({
        where: {
            CIpersona: ci
        }
    });

    const organizador = await Organizador.findOne({
        where: {
            CIpersona: ci
        }
    })

    const fotografo = await Fotografo.findOne({
        where: {
            CIpersona: ci
        }
    })

    if(persona === null){
        res.json({mensaje: 'Nombre de Usuario no valido'});
        return;
    };

    bcrypt.compare(password, persona.password,function(err, result) {
        if (err) {
            res.json({mensaje: err})
        } else if (result) {
            let tipo = '';
            if(fotografo !== null){
                tipo = 'fotografo';
                res.json({ci: ci, existe: result, tipo: tipo});
            }else if(invitado !== null){
                tipo = 'invitado';
                res.json({ci: ci, existe: result, tipo: tipo});
            }else if(organizador !== null){
                tipo = 'organizador';
                res.json({ci: ci, existe: result, tipo: tipo});
            }
        } else {
            res.json({mensaje: 'Contraseña Incorrecta'})
        }
    })
}