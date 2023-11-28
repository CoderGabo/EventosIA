const express = require('express');
const router = express.Router();

const personasController = require('../controllers/PersonasController');
const invitadosController = require('../controllers/InvitadosController');
const fotografoController = require('../controllers/FotografosController');
const organizadorController = require('../controllers/OrganizadorController');
const eventoController = require('../controllers/EventosController');
const entradaController = require('../controllers/EntradaController');
const fotografiaController = require('../controllers/FotografiaController');
const usuarioController = require('../controllers/UsuarioController');
const pagosController = require('../controllers/PagosController');

module.exports = function(){
    // Persona
    router.post('/registrar-persona', 
        personasController.registrarPersona
    );

    // ModificarDatos Persona
    router.put('/persona/:idPersona',
        personasController.modificarPersona
    );

    router.put('/persona/password/:idPersona',
        personasController.modificarContraseñaPersona
    );

    router.delete('/persona/:id',
        personasController.eliminarPersona
    );

    // Invitado
    router.post('/registrar-invitado',
        invitadosController.registrarInvitado
    );

    router.put('/registrar-invitado/:idPersona',
        invitadosController.subirFotografia
    );

    router.get('/invitado/imagen/:id',
        invitadosController.mostrarImagen
    );

    router.get('/invitados/:codigoEvento',
        invitadosController.obtenerInvitados
    )

    router.get('/invitado/:id',
        invitadosController.obtenerInvitado
    );

    router.get('/invitados',
        invitadosController.obtenerTodosInvitados
    );

    //Fotografo
    router.post('/registrar-fotografo',
        fotografoController.registrarFotografo
    );

    router.get('/fotografos/:codigo_evento',
        fotografoController.obtenerFotografos
    );

    router.get('/fotografos/evento/:codigoEvento',
        fotografoController.obtenerFotografoInvitado
    )

    //Organizador
    router.post('/registrar-organizador',
        organizadorController.registrarOrganizador
    );

    
    router.get('/obtener-eventos/publicos/:CIorganizador',
        organizadorController.obtenerEventosPublicos
    )

    // Evento
    router.post('/evento', 
        eventoController.registrarEvento
    );

    router.delete('/evento/:codigo',
        eventoController.eliminarEvento
    );

    router.put('/evento/:codigo',
        eventoController.modificarEvento
    );

    router.get('/evento/:codigo',
        eventoController.obtenerEvento
    );

    router.get('/eventos/:CIorganizador',
        eventoController.obtenerEventos
    );

    // Invitaciones invitados
    router.post('/entrada/:codigoEvento/:CIinvitado',
        entradaController.generarInvitacionesI,
        entradaController.generarQR
    );

    router.put('/entrada/:codigoEvento/:CIinvitado',
        entradaController.modificarAsistenciaInvitado
    );

    router.get('/entrada/:CIinvitado',
        entradaController.ObtenerEventosInvitado
    );

    router.get('/entrada/publico/:CIinvitado',
        entradaController.ObtenerEventosPublicosI
    );

    router.delete('/entrada/:codigoEvento/:CIfotografo',
        entradaController.EliminarInvitacionI
    );

    // Invitacion fotografos
    router.post('/invitaciones/:codigoEvento/:CIfotografo',
        entradaController.generarInvitacionesF,
        entradaController.generarQR
    );

    router.put('/invitacion/:codigoEvento/:CIfotografo',
        entradaController.modificarAsistenciaFotografo
    )

    router.delete('/invitaciones/:codigoEvento/:CIfotografo',
        entradaController.EliminarInvitacionF
    );

    router.get('/invitacion/:CIfotografo',
        entradaController.ObtenerEventosFotografo
    );

    router.get('/invitacion/publico/:CIfotografo',
        entradaController.ObtenerEventosPublicosF
    );

    // Modificar asistencia
    router.post('/entrada/asistencia/:codigoEvento/:CIinvitado',
        entradaController.modificarAsistenciaInvitado
    );

    router.post('/invitaciones/asistencia/:codigoEvento/:CIfotografo',
        entradaController.modificarAsistenciaFotografo
    );

    router.get('/entrada',
        entradaController.obtenerListaInvitados
    );

    //Fotografia
    router.post('/fotografia/:codigoEvento/:CIfotografo',
        fotografiaController.subirFoto,
        fotografiaController.encontrarInvitados
    );

    router.get('/fotografia/:CIinvitado',
        fotografiaController.obtenerFotosInvitados
    );

    router.get('/fotografia/evento/:codigoEvento',
        fotografiaController.obtenerFotos
    );

    router.get('/fotografia/evento/:codigoEvento/:CIinvitado',
        fotografiaController.obtenerFotosFiltrada
    )

    // Pago

    router.post('/pagos/:codigoEvento/:CIinvitado',
        pagosController.createSession
    );

    router.get('/detalle',
        pagosController.obtenerDetalle
    )

    router.delete('/detalleCompra',
        pagosController.eliminarDetalle
    )

    // Usuario

    router.post('/login',
        usuarioController.Login
    );
    
    return router
}   
