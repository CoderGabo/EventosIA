const Evento = require('../models/Evento');
const shortid = require('shortid');
const { PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require('../libs/s3Client.js');

exports.registrarEvento = async (req, res, next) => {
    const evento = req.body;

    evento.CIOrganizador = req.query.idOrganizador;

    const codigo = shortid.generate();

    evento.codigo = codigo;

    try {
        await Evento.create(evento);

        // Set the parameters
        const params = {
          Bucket: "evento-fotos",
          Key: `${codigo}/`, 
          Body: "",
        };

        try {
            const results = await s3Client.send(new PutObjectCommand(params));
            console.log(
                "Carpeta creada exitosamente:", results
            );

            res.json({mensaje: 'Evento creado exitosamente!'});
        } catch (err) {
        res.json({mensaje: 'Error al crear la carpeta'});
        }

    } catch (error) {
        res.json({mensaje: 'Hubo un error, intente de nuevo'});
    }
};

exports.eliminarEvento = async(req, res, next) => {
    try {
        await Evento.destroy({
            where:{
                codigo: req.params.codigo
            }
        });

        try {

            const params = {
                Bucket: "evento-fotos", 
                Prefix: `${req.params.codigo}/`, 
            };

            const data = await s3Client.send(new ListObjectsV2Command(params));
        
            // Elimina cada objeto dentro de la carpeta y sus subcarpetas
            const deleteObjectPromises = data.Contents.map(async (object) => {
              const deleteObjectParams = {
                Bucket: 'evento-fotos',
                Key: object.Key
              };
        
              await s3Client.send(new DeleteObjectCommand(deleteObjectParams));
              console.log("Objeto eliminado:", object.Key);
            });
        
            // Espera a que todas las eliminaciones se completen
            await Promise.all(deleteObjectPromises);
            res.json({mensaje: 'Evento eliminado exitosamente'});
            console.log("Carpeta eliminada exitosamente:", folderKey);
          } catch (err) {
            console.error("Error al eliminar la carpeta:", err);
            res.json({mensaje: 'Error al eliminar el evento'})
          }
    } catch (error) {
        res.json({mensaje: 'Ocurrio un error al intentar eliminar el evento'});
        next();
    }
};

exports.modificarEvento = async (req, res, next) => {
    const {nombre, descripcion, publicidad, cantidad_invitados ,fecha, estado} = req.body;

    console.log(nombre, descripcion,estado)

    try {
        const evento = await Evento.findOne({
            where: {codigo: req.params.codigo},
        });

        evento.nombre = nombre;
        evento.descripcion = descripcion;
        evento.publicidad = publicidad;
        evento.cantidad_invitados = cantidad_invitados;
        evento.fecha = fecha
        evento.estado = estado

        console.log(evento.estado)

        await evento.save();
        res.json({mensaje: 'Evento modificado exitosamente'})
    } catch (error) {
        res.json({mensaje: 'Ocurrio un error al intentar modificar el evento'});
        next();
    }

};

exports.obtenerEvento = async (req, res, next) => {
    try {
        const evento = await Evento.findOne({
            where: {
                codigo: req.params.codigo
            }
        });
        res.json(evento)
    } catch (error) {
        res.json({mensaje: 'Ocurrio un error al obtener el evento'});
        next();
    }
};

exports.obtenerEventos = async (req, res, next) => {
    try {
        const evento = await Evento.findAll({
            where: {
                CIOrganizador: req.params.CIorganizador
            },
            attributes: ['codigo','nombre','descripcion','publicidad','cantidad_invitados','fecha','estado']
        });
        res.json(evento)
    } catch (error) {
        res.json({mensaje: `Ocurrio un error al obtener el evento: ${error}`});
        next();
    }
};