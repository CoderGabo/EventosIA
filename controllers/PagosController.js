const { Stripe } = require('stripe');
const stripe = new Stripe('sk_test_51OGv2gKIMRn2BAKSnuGqZ3RdJjFlHu2iu53pPkTJLVBtYxkgrubbg4b7Dtr3Zx6dQa3XSvZzePpbHjCSpagS7rfY00cqs9vcje');

const cloudinary = require('../config/cloudinary');

const Detalle = require('../models/Detalle');
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs').promises;
const axios = require('axios');

exports.createSession = async(req, res) =>{
    const lista = req.body;

    // Utilizar un objeto Map para almacenar elementos únicos basados en la propiedad urlAgua
    const mapaUnico = new Map();
    const datos = {
      listaFotografias: []
    };

    lista.forEach(objeto => {
        const secureUrl = objeto.urlAgua;
        const regex = /\/Album\/(.+)$/;

        const match = secureUrl.match(regex);

        if (match) {
          const rutaDesdeAlbum = match[0].substring(1);
          const rutaSinextension = rutaDesdeAlbum.replace(/\.jpg$/, '')
          datos.listaFotografias.push(rutaSinextension)
        }
        // Utilizar la propiedad urlAgua como clave para identificar elementos únicos
        mapaUnico.set(objeto.urlAgua, objeto);
    });

    //Convertir el Map de nuevo a una lista
    const listaUnica = [...mapaUnico.values()];

    await Detalle.create(datos);

    const lineItems = listaUnica.map((objeto, index) => ({
        price_data: {
          product_data: {
            name: `Foto ${index+1}`, // Puedes usar cualquier nombre aquí
            description: 'Foto para comprar'
          },
          currency: 'usd', // O la moneda que prefieras
          unit_amount: objeto.precio * 100, // Convertir a centavos (Stripe utiliza montos en centavos)
        },
        quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: 'payment',
        success_url: `http://localhost:5173/sucess/${req.params.codigoEvento}/${req.params.CIinvitado}`,
        cancel_url: `http://localhost:5173/cancel/${req.params.codigoEvento}/${req.params.CIinvitado}`
    });

    return res.json(session)
};

exports.obtenerDetalle = async (req, res, next) => {
  try {
    const detalle = await Detalle.findAll();
    const listaFotografias = detalle[0].listaFotografias;

    const imagen = await cloudinary.api.resources_by_ids(listaFotografias);

    async function descargarImagen(url) {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      return new Uint8Array(response.data);
    }
    
    // Función para crear un PDF con varias imágenes
    async function crearPDF(conjuntoDeImagenes) {
      const pdfDoc = await PDFDocument.create();

      try {
            // Itera sobre cada imagen en el conjunto
        for (const imagen of conjuntoDeImagenes) {
          const { width, height } = imagen; // Utiliza las dimensiones de la imagen

          // Añade una nueva página al PDF
          const page = pdfDoc.addPage([width, height]);
      
          // Descarga la imagen
          const imagenUint8Array = await descargarImagen(imagen.secure_url);
      
          //Embebe la imagen en la página del PDF
          const imagenEmbed = await pdfDoc.embedJpg(imagenUint8Array);
          // const { width: imagenWidth, height: imagenHeight } = imagenEmbed.scale(0.5);
          //Dibuja la imagen en la página
          page.drawImage(imagenEmbed, {
            x: 0,
            y: 0, // Ajusta según sea necesario
            width: width,
            height: height,
          });
        }
      
        return pdfDoc.save();
      } catch (error) {
        console.log(error)
      }
    
    }

    // Crea el PDF con las imágenes
    const pdfBytes = await crearPDF(imagen.resources);

    // Convierte el Uint8Array a base64
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    res.json(pdfBase64);
  } catch (error) {
    res.json({mensaje: 'No hay detalle para recuperar'})
    return;
  }
};

exports.eliminarDetalle = async(req, res) => {
  console.log('Entre')
  try {
      await Detalle.destroy({
        where: {},
        truncate: true
      });

      res.json({mensaje: 'Eliminado Correctamente'});
  } catch (error) {
    console.log(error)
    res.json({mensaje: 'Ocurrio un error'});
    return;
  }
}