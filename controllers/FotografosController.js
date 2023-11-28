
const Fotografo = require('../models/Fotografo');
const Persona = require('../models/Persona');
const Invitacion = require('../models/Invitacion');

exports.registrarFotografo = async (req, res, next) => {
    const fotografo = req.body;

    fotografo.CIpersona = req.query.idPersona


    try {
        await Fotografo.create(fotografo)
        res.json({mensaje: 'Fotografo Creado Correctamente'});
    } catch (error) {
        res.json({mensaje: 'Hubo un error, por favor intente de neuvo'})
        next();
    }

};

exports.obtenerFotografos = async(req, res, next) => {
    const fotografos = [];

    try {
        const datosFotrogafos = await Fotografo.findAll(
            {
                include: [{
                    model: Persona, 
                    as: 'persona',
                    attributes: ['nombre','email','telefono'],
                }],
                order: [['Estrellas', 'DESC']],
            }
        );

        for (let i = 0; i < datosFotrogafos.length; i++) {
            const fotografo = datosFotrogafos[i];
            const respuesta = await Invitacion.findOne({
              where: {
                codigo_evento: req.params.codigo_evento,
                CIfotografo: fotografo.CIpersona,
              },
            });

            const datos = {};

            datos.nombre = fotografo.persona.nombre;
            datos.email = fotografo.persona.email;
            datos.telefono = fotografo.persona.telefono;
            datos.estrellas = fotografo.Estrellas;
            datos.experiencia = fotografo.Experiencia;
            datos.empresa = fotografo.empresa === '' ? 'No trabaja con una empresa' : fotografo.empresa;
            datos.CIpersona = fotografo.CIpersona;
        
            if(respuesta === null){
                datos.invitado = false;
            }else{
                datos.invitado = true;
            }
            fotografos.push(datos);
        }
        res.json(fotografos);
    } catch (error) {
        res.json({mensaje: 'Hubo un error, por favor intente de nuevo'})
        next();
    }
    
};

exports.obtenerFotografoInvitado = async (req, res,next) => {
    try {
        const fotografos = await Invitacion.findAll({
            where: {
                codigo_evento: req.params.codigoEvento
            },
            include: [{
                model: Fotografo, 
                as: 'fotografo',
                attributes: ['Estrellas'],
                include: [{
                    model: Persona,
                    as: 'persona',
                    attributes: ['nombre','email']
                }]
            }],
            attributes:['hora_inicio']
        })

        res.json(fotografos)
    } catch (error) {
        res.json({mensaje: `Hubo un error, por favor intente de nuevo ${error}`})
        next();
    }
}