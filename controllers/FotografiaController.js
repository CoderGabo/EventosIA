const Fotografia = require('../models/Fotografia');
const Entrada = require('../models/Entrada.js');

const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("../libs/s3Client.js");

const cloudinary = require('../config/cloudinary');
const fs = require('fs');
let AWS = require('aws-sdk');
const Sequelize = require('sequelize');

const { Op } = require('sequelize');

exports.subirFoto = async(req, res, next) => {
    if(!req.files || Object.keys(req.files).length === 0){
        res.json({mensaje: 'No se ha ingresado ninguna imagen'});
        return;
    };
    // let totalArchivos = 0;

    // Object.keys(req.files).forEach((campo) => {
    //     totalArchivos += Array.isArray(req.files[campo]) ? req.files[campo].length : 1;
    // });

    const fileExtension = req.files.foto.name.split('.').pop().toLowerCase();

    const allowedExtensions = ['jpg', 'jpeg', 'png']; // Añade otras extensiones permitidas según tus necesidades

    if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).send('Formato de imagen no permitido');
    }

    const {tempFilePath} = req.files.foto;
    const fileContent = fs.readFileSync(tempFilePath);
    //Cloudinary
    cloudinary.uploader
    .upload(tempFilePath, {
        folder: 'Album',
        resource_type: 'image'})
    .then(async result => {
        const fotografia =  {
            foto: result.secure_url,
            precios: req.body.precio,
            CIfotografo: req.params.CIfotografo,
            codigo_evento: req.params.codigoEvento
        }
        try {
            await Fotografia.create(fotografia);
            
            // Set the parameters
            const params = {
                Bucket: "evento-fotos", 
                Key: `${req.params.codigoEvento}/${req.files.foto.name}`,
                Body: fileContent,
                ContentType: `image/${fileExtension}`
            };

            // Create an object and upload it to the Amazon S3 bucket.
            try {
                await s3Client.send(new PutObjectCommand(params));
                // Pasa datos al siguiente middleware
                res.locals.urlFotografia = {
                    url: result.secure_url,
                    Evento: req.params.codigoEvento,
                    name: req.files.foto.name
                };
                next();
            } catch (err) {
                res.json({mensaje: 'Hubo un error, por favor intente de nuevo'})
                next();
            }
        } catch (error) {
            console.log(error)
            res.json({mensaje: 'Hubo un error, por favor intente de nuevo'})
            next();
        }
    })
    .catch(error => {
        res.json(error)
    })

};

exports.encontrarInvitados = async (req, res, next) => {
    const { url, Evento, name } = res.locals.urlFotografia;
    const s3 = new AWS.S3();

    const bucketInvitados = 'invitados-fotos';
    const bucketFotos = 'evento-fotos';

    const fotografia = await Fotografia.findOne({
        where:{
            foto: `${url}`
        }
    })

    if (fotografia.listaInvitados === null){
        fotografia.listaInvitados = []
    };

    const photo_source  = `${Evento}/${name}` // the name of file
    // const photo_source  = `_gYTQ1pGP/IMG-20221217-WA0072.jpg`
    try {
        const Invitados = await Entrada.findAll({
            where: {
                codigo_evento: `${Evento}`
                // codigo_evento: '_gYTQ1pGP'
            },
            attributes: ['CIinvitado']
        })

        // await Invitados.map(async invitado => {
        //     const params = {
        //         Bucket: bucketInvitados,
        //         Prefix: `${invitado.CIinvitado}/`
        //     };
            
        //     const data = s3.listObjectsV2(params, (err, data) => {
        //     if (err) {
        //         console.error(err);
        //     } else {
        //         data.Contents.forEach((obj) => {
        //             const imagen = obj.Key.split('/')[1];
        //             const photo_target = `${invitado.CIinvitado}/${imagen}`;

        //             AWS.config.update({region:'us-east-1'});
        //             const client = new AWS.Rekognition();
        //             const params = {
        //                 SourceImage: {
        //                 S3Object: {
        //                     Bucket: bucketFotos,
        //                     Name: photo_source
        //                 },
        //                 },
        //                 TargetImage: {
        //                 S3Object: {
        //                     Bucket: bucketInvitados,
        //                     Name: photo_target
        //                 },
        //                 },
        //                 SimilarityThreshold: 70
        //             }
        //             client.compareFaces(params, function(err, response) {
        //                 if (err) {
        //                     console.log(err, err.stack); // an error occurred


        //                 if (err.code === 'InvalidS3ObjectException') {
        //                     console.error("Detalles del error:", err.message);
        //                     // Agrega cualquier acción que necesites realizar para manejar este tipo de error
        //                 }
        //                 } else {
        //                 response.FaceMatches.forEach(async data => {
        //                     console.log('Entre!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
        //                     fotografia.listaInvitados.push(invitado.CIinvitado);
        //                 }) // for response.faceDetails
        //                 } // if
        //             });
        //         });
        //     }
        //     });

        // });
        // console.log(fotografia.listaInvitados)
        
        // await fotografia.save();
        const listaInvitados = [];

        for (const invitado of Invitados) {
            const params = {
                Bucket: bucketInvitados,
                Prefix: `${invitado.CIinvitado}/`
            };
    
            const data = await s3.listObjectsV2(params).promise();
            for (const obj of data.Contents) {
                const imagen = obj.Key.split('/')[1];
                const photo_target = `${invitado.CIinvitado}/${imagen}`;

                AWS.config.update({ region: 'us-east-1' });
                const client = new AWS.Rekognition();
                const params = {
                    SourceImage: {
                        S3Object: {
                            Bucket: bucketInvitados,
                            Name: photo_target
                        },
                    },
                    TargetImage: {
                        S3Object: {

                            Bucket: bucketFotos,
                            Name: photo_source
                        },
                    },
                    SimilarityThreshold: 70
                };
    
                try {
                    const response = await client.compareFaces(params).promise();
                    response.FaceMatches.forEach(match => {
                        // Puedes acceder a información específica de la coincidencia aquí
                        // Por ejemplo, el ID de la cara coincidente: match.Face.FaceId
                        listaInvitados.push(invitado.CIinvitado);
                    });
                } catch (err) {
                    console.log(err, err.stack);
                    if (err.code === 'InvalidS3ObjectException') {
                        console.error("Detalles del error:", err.message);
                        // Agrega cualquier acción que necesites realizar para manejar este tipo de error
                    }
                }
            }
        }
    
        fotografia.listaInvitados = listaInvitados;
    
        // Guardar una sola vez después de procesar todas las coincidencias
        await fotografia.save();
        res.json({ mensaje: `Notificaciones enviadas` });
    } catch (error) {
        res.json({mensaje: 'Ocurrio un error'});
        next();
    }
};

exports.obtenerFotosInvitados = async(req, res, next) => {
    try {
        const fotos = await Fotografia.findAll({
            where: {
                listaInvitados: {
                    [Sequelize.Op.contains]: [req.params.CIinvitado]
                }
            },
            attributes: ['id','foto','codigo_evento']
        })
        res.json(fotos);
    } catch (error) {
        res.json({mensaje: 'Ocurrio un error'});
        next();
    }
};

exports.obtenerFotos = async (req, res, next) => {
    const listaFotos = [];
    try {
        const fotos = await Fotografia.findAll({
            where:{
                codigo_evento: req.params.codigoEvento
            },
            attributes: ['foto']
        });

        fotos.map(foto => {
            const secureUrl = foto.foto;
            const regex = /\/Album\/(.+)$/;

            const match = secureUrl.match(regex);
            if (match) {
                const rutaDesdeAlbum = match[0];
                
                // Ejemplo de uso
                const urlAgua = cloudinary.url(rutaDesdeAlbum, {
                    transformation: [
                      { gravity: "auto", height: 500, width: 500, crop: "thumb" },
                      {color: '#FFFFFF',overlay: { font_family: "arial", font_size: 100, text: "EventosIA", opacity: 80 }},
                      { flags: "layer_apply", gravity: "center" },
                      { quality: 10 }
                    ]
                });
                  
                listaFotos.push(urlAgua)

            } else {
            console.error("No se pudo extraer la ruta desde /Album");
            }
        })

        res.json(listaFotos)
    } catch (error) {
        res.json({mensaje: 'Ocurrio un error'});
        next();
    }
};

exports.obtenerFotosFiltrada = async(req, res, next) => {
    const listaFotos = [];
    try {
        const fotos = await Fotografia.findAll({
            where: {
                codigo_evento: req.params.codigoEvento,
                listaInvitados: {
                    [Op.contains]: [req.params.CIinvitado],
                }
            },
            attributes: ['foto','precios']
        })

        fotos.map(foto => {
            const secureUrl = foto.foto;
            const regex = /\/Album\/(.+)$/;

            const match = secureUrl.match(regex);
            if (match) {
                const rutaDesdeAlbum = match[0];
                
                // Ejemplo de uso
                const urlAgua = cloudinary.url(rutaDesdeAlbum, {
                    transformation: [
                      { gravity: "auto", height: 500, width: 500, crop: "thumb" },
                      {color: '#FFFFFF',overlay: { font_family: "arial", font_size: 100, text: "EventosIA", opacity: 80 }},
                      { flags: "layer_apply", gravity: "center" },
                      { quality: 10 }
                    ]
                });

                const datos = {
                    urlAgua: urlAgua,
                    precio: foto.precios
                }
                  
                listaFotos.push(datos)

            } else {
                console.error("No se pudo extraer la ruta desde /Album");
            }
        })

        res.json(listaFotos)
    } catch (error) {
        res.json({mensaje: `Ocurrio un error ${error}`});
        next();
    }
}