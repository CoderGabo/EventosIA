
const Organizador = require('../models/Organizador');
const Evento = require('../models/Evento');

const { Op } = require('sequelize');

exports.registrarOrganizador = async (req, res, next) => {
    const organizador = req.body;

    organizador.CIpersona = req.query.idPersona

    try {
        await Organizador.create(organizador)
        res.json({mensaje: 'Organizador Creado Correctamente'});
    } catch (error) {
        res.json({mensaje: 'Hubo un error, por favor intente de neuvo'})
        next();
    }

};

exports.obtenerEventosPublicos = async(req, res, next) => {
    try {
        const eventos = await Evento.findAll({
            where: {
                publicidad: 'publico',
                CIOrganizador: {
                  [Op.ne]: req.params.CIorganizador
                }
              }
        });

        res.json(eventos)
    } catch (error) {
        res.json({mensaje: `Hubo un error, por favor intente de nuevo ${error}`})
        next();
    }
}