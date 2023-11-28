const express = require('express');
const fileUpload = require('express-fileupload');
const routes = require('./routes');
const bodyParser = require('body-parser');

const cors = require('cors');

const PORT = process.env.PORT || 5000;

const app = express();

const db = require('./config/db')
    db.sync().then(() => console.log('DB Conectada')).catch((error) => console.log(`No se puede conectar a la BD: ${error}`))


//Habilitar bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(cors());

//Habilitanto el fileUpload
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

//Rutas de la app
app.use('/',routes());

app.listen(PORT, () => {
    console.log(`El servidor esta funcionando en el puerto: ${PORT}`)
})