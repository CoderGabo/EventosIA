const Persona = require('../models/Persona');
const Invitado = require('../models/Invitado');
const bcrypt = require('bcrypt');

exports.registrarPersona = async (req, res, next) => {
    const persona = req.body;

    persona.password = await bcrypt.hash(req.body.password, 12);

    try {
        await Persona.create(persona)
        res.json({mensaje: 'Persona Creada Correctamente'});
    } catch (error) {
        if(error.name === "SequelizeUniqueConstraintError"){
            res.json({mensaje: 'Este invitado ya fue registrado. Por favor verifique los datos.'});
            next();
            return;
        }
        res.json({mensaje: 'Hubo un error. Intentálo de nuevo'})
        next();
    }

};

exports.modificarPersona = async (req, res, next) => {
    const {nombre, domicilio, telefono, edad} = req.body;

    const persona = await Persona.findOne({
        where: {ci: req.params.idPersona},
    })

    persona.nombre = nombre;
    persona.domicilio = domicilio;
    persona.telefono = telefono;
    persona.edad = edad;

    try {
        await persona.save()
        res.json({mensaje: 'Datos Modificados Correctamente'});
    } catch (error) {
        res.json({mensaje: 'Hubo un error, por favor intente de neuvo'})
        next();
    }
};

exports.modificarContraseñaPersona = async (req, res, next) => {
    const {password, repetirpassword} = req.body;

    const persona = await Persona.findOne({
        where: {ci: req.params.idPersona},
    })

    if(password != repetirpassword){
        await res.json({mensaje: 'La contraseña debe ser la misma'})
        next();
    }else{
        try {
            persona.password = await bcrypt.hash(password, 12);
            await persona.save();
            res.json({mensaje: 'Contraseña actualizada'})
        } catch (error) {
            res.json({mensaje: 'Hubo un error, por favor intente de nuevo'})
            next();
        }
    }
};

exports.eliminarPersona = async(req, res, next) => {
    const invitado = await Invitado.findOne({
        where: {
            CIpersona: req.params.id
        }
    })

    if(invitado !== null){
        try {
            await Persona.destroy({
                where: {
                    ci: req.params.id
                }
            });
            res.json({mensaje: 'El invitado fue removido'})
        } catch (error) {
            res.json({mensaje: error})
            next();   
        }
    }else{
        res.json({mensaje: 'Eliminación no permitida'})
    }
    
}