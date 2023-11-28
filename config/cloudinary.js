// import {v2 as cloudinary} from 'cloudinary';
          
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'drbltrbrt',
  api_key: '384646977941969',
  api_secret: 'HIyBdZoKlpGusxucJgGyf1aVhIs',
  secure: true,
});

// cloudinary.api
// .resource_by_asset_id('5a618544821b301b38e8982d55968225')
// .then(console.log)

// cloudinary.v2.api
//   .delete_resources(['fotografias/zmbbgmxf9kqaoqvsjncp'], 
//     { type: 'upload', resource_type: 'image' })
//   .then(console.log);

module.exports = cloudinary
