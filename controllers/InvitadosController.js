
const Invitado = require('../models/Invitado');
const Persona = require('../models/Persona');
const Entrada = require('../models/Entrada.js');

const cloudinary = require('../config/cloudinary');

const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("../libs/s3Client.js");

const fs = require('fs');

exports.registrarInvitado = async (req, res, next) => {

    const invitado =  {
        fotografia: '',
        CIpersona: req.query.idPersona
    }

    try {
        await Invitado.create(invitado)
        res.json({mensaje: 'Invitado Creado Correctamente'});

    } catch (error) {
        console.log(error);
        res.json({mensaje: 'Hubo un error, por favor intente de nuevo'})
        next();
    }
}

exports.mostrarImagen = async (req, res, next) => {
    try {
        const invitado = await Invitado.findOne({
            where:{
                CIpersona: req.params.id
            }
        });
        res.json(invitado.fotografia);
    } catch (error) {
        res.json({mensaje: 'Ocurrio un error al obtener la imagen'});
        next();
    }
};

exports.obtenerInvitado = async (req, res, next) => {
    try {
        const invitado = await Invitado.findOne({
            where:{
                CIpersona: req.params.id,
            },
            attributes: ['CIpersona','fotografia'],
            include: [{
                model: Persona,
                as: 'persona',
                attributes: ['nombre','domicilio','telefono','email','edad'],
            }]
        });
        res.json(invitado);
    } catch (error) {
        res.json({mensaje: 'Ocurrio un error al obtener al invitado'});
        next();
    }
};

exports.obtenerInvitados = async(req, res, next) => {
    const lista = [];
    try {
        const listaInvitados = await Entrada.findAll({
            where: {
                codigo_evento: req.params.codigoEvento
            },
            attributes: ['asistencia'],
                include: [{
                    model: Invitado, 
                    as: 'invitado',
                    attributes: ['fotografia'],
                    include: [{
                        model: Persona,
                        as: 'persona',
                        attributes: ['nombre','domicilio','telefono','email','edad']
                    }]
                }]
        })
        listaInvitados.map((listaI) => {
            const datos = {
                asistencia: listaI.asistencia,
                fotografia: listaI.invitado.fotografia,
                nombre: listaI.invitado.persona.nombre,
                domicilio: listaI.invitado.persona.domicilio,
                telefono: listaI.invitado.persona.telefono,
                email: listaI.invitado.persona.email,
                edad: listaI.invitado.persona.edad,
            };
            
            lista.push(datos);
        })
        res.json(lista);
    } catch (error) {
        res.json({mensaje: `Ocurrio un error al obtener al invitado`});
        next();
    }
};

exports.subirFotografia = async (req, res, next) => {
    if(!req.files || Object.keys(req.files).length === 0){
        res.json({mensaje: 'No se ha ingresado ninguna imagen'});
        next();
        return;
    }

    const {tempFilePath} = req.files.fotografia;
    const fileContent = fs.readFileSync(tempFilePath);

    const invitado = await Invitado.findByPk(req.params.idPersona);
    //Cloudinary
    cloudinary.uploader
    .upload(tempFilePath, {
        folder: 'fotografias',
        resource_type: 'image'})
    .then(async result => {
        invitado.fotografia = result.secure_url;
        try {
            await invitado.save();
            // Set the parameters
            const params = {
              Bucket: "invitados-fotos", 
              Key: `${req.params.idPersona}/${req.files.fotografia.name}`,
              Body: fileContent,
              ContentType: "image/jpeg"
            };

            // Create an object and upload it to the Amazon S3 bucket.
            try {
                await s3Client.send(new PutObjectCommand(params));

                res.json({mensaje: 'Invitado Creado Correctamente'});
            } catch (err) {
                console.log({mensaje: 'Hubo un error, por favor intente de nuevo'});
                next();
            }
        } catch (error) {
            res.json({mensaje: 'Hubo un error, por favor intente de nuevo'})
            next();
        }
    })
    .catch(error => {
        res.json(error)
    })

};

exports.obtenerTodosInvitados = async(req, res, next) => {
    try {
        const invitados = await Invitado.findAll({
            include: [{
                model: Persona,
                as: 'persona',
                attributes: ['nombre','domicilio','telefono','email','edad']
            }],
            attributes: ['CIpersona']
        })
        res.json(invitados);
    } catch (error) {
        res.json({mensaje: 'Hubo un error, por favor intente de nuevo'})
        next();
    }
};