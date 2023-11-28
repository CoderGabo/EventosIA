
const Fotografo = require('../models/Fotografo');
const Invitado = require('../models/Invitado');
const Persona = require('../models/Persona');
const Eventos = require('../models/Evento');
const Entrada = require('../models/Entrada');
const Invitacion = require('../models/Invitacion');

const moment = require('moment');

const qr = require('qrcode');
const nodemailer = require('nodemailer');

exports.generarInvitacionesI = async (req, res, next) => {
    const invitacion = req.body;
    invitacion.asistencia = true;
    invitacion.CIinvitado = req.params.CIinvitado
    invitacion.codigo_evento = req.params.codigoEvento

    try {
        await Entrada.create(invitacion);
        next();
    } catch (error) {
        res.json({mensaje: 'Ocurrio un error'});
        next();
    }
};

exports.generarInvitacionesF = async (req, res, next) => {
    const invitacion = req.body;
    invitacion.asistencia = true;
    invitacion.CIfotografo = req.params.CIfotografo
    invitacion.codigo_evento = req.params.codigoEvento

    try {
        await Invitacion.create(invitacion);
        next();
    } catch (error) {
        res.json({mensaje: 'Ocurrio un error'});
        next();
    }
};

exports.obtenerListaInvitados = async (req, res, next) => {
    const lista = {
        Invitados: [],
        Fotografos: [],
    };
    try {
        const ListaInvitados = await Entrada.findAll({
            where: {asistencia: true},
            attributes: ['asistencia'],
            include: [{
                model: Invitado, 
                as: 'invitado',
                attributes: ['CIpersona'],
                include: [{
                    model: Persona,
                    as: 'persona',
                    attributes: ['nombre','domicilio','telefono','email','edad']
                }]
            }]
        });

        const ListaFotografos = await Invitacion.findAll({
            where: {asistencia: true},
            attributes: ['asistencia'],
            include: [{
                model: Fotografo, 
                as: 'fotografo',
                attributes: ['CIpersona'],
                include: [{
                    model: Persona,
                    as: 'persona',
                    attributes: ['nombre','domicilio','telefono','email','edad']
                }]
            }]
        });

        ListaInvitados.map(invitado => lista.Invitados.push(invitado.toJSON().invitado.persona))

        ListaFotografos.map(fotografo => lista.Fotografos.push(fotografo.toJSON().fotografo.persona))

        res.json(lista);
    } catch (error) {
        res.json({mensaje: 'Ocurrio un error'});
        next();
    }
};

exports.generarQR = async(req, res, next) => {
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "688e2bc571c3ab",
          pass: "38af8be8752c43"
        }
    });

    const codigo_evento = req.params.codigoEvento;

    const evento = await Eventos.findOne({
        where: {
            codigo: codigo_evento
        }
    });

    try {

        if(req.params.CIinvitado !== undefined){
            const CIinvitado = req.params.CIinvitado
            const invitado = await Entrada.findOne({
                where: {CIinvitado: req.params.CIinvitado},
                attributes: ['asistencia', 'hora_inicio'],
                include: [{
                    model: Invitado, 
                    as: 'invitado',
                    attributes: ['CIpersona'],
                    include: [{
                        model: Persona,
                        as: 'persona',
                        attributes: ['nombre','domicilio','telefono','email','edad']
                    }]
                }]
            });
            const hora = invitado.toJSON().hora_inicio;
            const email = invitado.toJSON().invitado.persona.email;
            const nombre = invitado.toJSON().invitado.persona.nombre;

            const url = `http://192.168.0.11:5173/credenciales/${encodeURIComponent(nombre)}/${CIinvitado}/${codigo_evento}`
            const codigoQR = await qr.toDataURL(url);
            console.log(url);

            const mailOptions = {
                from: 'EventoIA@empresa.com',
                to: `${email}`,
                subject: `Invitación al Evento ${evento.nombre}`,
                html: `
                    <h3>Hola ${nombre}</h3>
                    <p>Usted a sido invitado al evento ${evento.nombre}</p>
                    <p>Detalles del Evento: ${evento.descripcion}</p>
                    <p>El evento sera el: ${moment(evento.fecha).format('DD/MM/YYYY')} y comienza a las ${hora}</p>
                    <h5>Si planea asistir por favor escanee el Código QR para marcar su asistencia</h5>
                    <img src="${codigoQR}" alt="QR code"/>
                `
            }
            
            transporter.sendMail(mailOptions, (error, info) => {
                if(error){
                    console.log('Error al enviar el correo: ', error)
                }else{
                    console.log('Correo enviado', info.response)
                }
            });
        }else{
            if(req.params.CIfotografo !== undefined){
                const CIfotografo = req.params.CIfotografo;
                const fotografo = await Invitacion.findOne({
                    where: {CIfotografo: req.params.CIfotografo},
                    attributes: ['asistencia', 'hora_inicio'],
                    include: [{
                        model: Fotografo, 
                        as: 'fotografo',
                        attributes: ['CIpersona'],
                        include: [{
                            model: Persona,
                            as: 'persona',
                            attributes: ['nombre','domicilio','telefono','email','edad']
                        }]
                    }]
                });

                const hora = fotografo.toJSON().hora_inicio;
                const nombre = fotografo.toJSON().fotografo.persona.nombre;
                const email = fotografo.toJSON().fotografo.persona.email;

                const url = `http://192.168.0.11:5173/credenciales/asistencia/${CIfotografo}/${codigo_evento}`
                const codigoQR = await qr.toDataURL(url);

                const mailOptions = {
                    from: 'EventoFotos@empresa.com',
                    to: `${email}`,
                    subject: `Invitación al evento ${evento.nombre}`,
                    html: `
                    <h3>Hola ${nombre}</h3>
                    <p>Usted a sido invitado al evento ${evento.nombre} con el fin de tomar fotografias a todos los invitados del evento.</p>
                    <p>Detalles del Evento: ${evento.descripcion}</p>
                    <p>El evento sera el: ${moment(evento.fecha).format('DD/MM/YYYY')} y comienza a las ${hora}</p>
                    <h5>Si planea asistir por favor escanee el Código QR para marcar su asistencia</h5>
                    <img src="${codigoQR}" alt="QR code"/>
                    `
                }
                
                transporter.sendMail(mailOptions, (error, info) => {
                    if(error){
                        console.log('Error al enviar el correo: ', error)
                    }else{
                        console.log('Correo enviado', info.response)
                    }
                });
            }
        }

        res.json({mensaje: 'Invitacion generada correctamente'});

    } catch (error) {
        throw error;
    }
};

exports.modificarAsistenciaInvitado = async (req, res, next) => {
    try {
        const entrada = await Entrada.findOne({
            where: {
                CIinvitado: req.params.CIinvitado,
                codigo_evento: req.params.codigoEvento
            },
        });
    
        entrada.asistencia = true;

        await entrada.save();
        res.json({mensaje: 'Asistencia actualizada'})
    } catch (error) {
        res.json({mensaje: 'Ocurrio un error'});
        next();
    }
};

exports.modificarAsistenciaFotografo = async (req, res, next) => {
    try {
        const invitado = await Invitacion.findOne({
            where: {
                CIfotografo: req.params.CIfotografo,
                codigo_evento: req.params.codigoEvento
            },
        });
    
        invitado.asistencia = true;

        await invitado.save();
        res.json({mensaje: 'Asistencia actualizada'})
    } catch (error) {
        res.json({mensaje: 'Ocurrio un error'});
        next();
    }
};

exports.EliminarInvitacionI = async (req, res, next) => {
    try {
        await Entrada.destroy({
            where: {
              codigo_evento: req.params.codigoEvento,
              CIfotografo: req.params.CIinvitado
            },
        });

        res.json({mensaje: 'Invitado Quitado con Exito'})
    } catch (error) {
        res.json({mensaje: 'Ocurrio un error'});
        next();
    }
};


exports.EliminarInvitacionF = async (req, res, next) => {
    try {
        await Invitacion.destroy({
            where: {
              codigo_evento: req.params.codigoEvento,
              CIfotografo: req.params.CIfotografo
            },
        });

        res.json({mensaje: 'Fotografo Quitado con Exito'})
    } catch (error) {
        res.json({mensaje: 'Ocurrio un error'});
        next();
    }
};

exports.ObtenerEventosInvitado = async (req, res, next) => {
    const listaEventos = [];
    try {
        const datos = await Entrada.findAll({
            where: {
                CIinvitado: req.params.CIinvitado
            },
            attributes: ['codigo_evento','hora_inicio']
        });
        const promesasEventos = datos.map(async (dato) => {
            const eventos = await Eventos.findOne({
                where: {
                    codigo: dato.codigo_evento
                },
                attributes: ['codigo', 'nombre', 'descripcion', 'fecha', 'publicidad']
            });
    
            // Agrega la propiedad 'hora_inicio' al objeto 'eventos'
            eventos.dataValues.hora_inicio = dato.hora_inicio;
            return eventos;
        });
    
        // Espera a que todas las promesas se resuelvan
        const listaEventos = await Promise.all(promesasEventos);
        res.json(listaEventos)
    } catch (error) {
        res.json({mensaje: `Ocurrio un errro ${error}`});
        next();
    }
};

exports.ObtenerEventosPublicosI = async (req, res, next) => {
    const listaEventos = [];
    try {
        const eventos = await Eventos.findAll({
            where: {
                publicidad: 'publico'
            },
            attributes: ['codigo','nombre','descripcion','cantidad_invitados']
        });

        if(eventos.length === 0){
            res.json({mensaje: 'No hay eventos publicos aun'});
            return;
        }

        for (let i = 0; i < eventos.length; i++) {
            const evento = eventos[i];
            const invitado = await Entrada.findOne({
                where: {
                    codigo_evento: evento.codigo,
                    CIinvitado: req.params.CIinvitado
                },
            });

            if(invitado === null){
                listaEventos.push(evento)
            } 
        }
        res.json(listaEventos)
    } catch (error) {
        res.json({mensaje: `Ocurrio un errro ${error}`});
        next();
    }
};


exports.ObtenerEventosFotografo = async (req, res, next) => {
    const listaEventos = [];
    try {
        const datos = await Invitacion.findAll({
            where: {
                CIfotografo: req.params.CIfotografo
            },
            attributes: ['codigo_evento','hora_inicio']
        });
        const promesasEventos = datos.map(async (dato) => {
            const eventos = await Eventos.findOne({
                where: {
                    codigo: dato.codigo_evento
                },
                attributes: ['codigo', 'nombre', 'descripcion', 'fecha']
            });
    
            // Agrega la propiedad 'hora_inicio' al objeto 'eventos'
            eventos.dataValues.hora_inicio = dato.hora_inicio;
            return eventos;
        });
    
        // Espera a que todas las promesas se resuelvan
        const listaEventos = await Promise.all(promesasEventos);
        res.json(listaEventos)
    } catch (error) {
        res.json({mensaje: `Ocurrio un errro ${error}`});
        next();
    }
};

exports.ObtenerEventosPublicosF = async (req, res, next) => {
    const listaEventos = [];
    try {
        const eventos = await Eventos.findAll({
            where: {
                publicidad: 'publico'
            },
            attributes: ['codigo','nombre','descripcion','cantidad_invitados']
        });

        if(eventos.length === 0){
            res.json({mensaje: 'No hay eventos publicos aun'});
            return;
        }

        for (let i = 0; i < eventos.length; i++) {
            const evento = eventos[i];
            const invitado = await Invitacion.findOne({
                where: {
                    codigo_evento: evento.codigo,
                    CIfotografo: req.params.CIfotografo
                },
            });

            if(invitado === null){
                listaEventos.push(evento)
            } 
        }
        res.json(listaEventos)
    } catch (error) {
        res.json({mensaje: `Ocurrio un errro ${error}`});
        next();
    }
};