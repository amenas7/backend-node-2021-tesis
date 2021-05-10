
/*
    Ruta : /api/ticket_resuelto
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { cambiandoestadoTicket } = require('../controllers/ticket_resuelto');
//const { getAreas, crearUsuario, actualizarUsuario, borrarUsuario, getUsuarioByID } = require('../controllers/areas');

const router = Router();

// router.get('/', validarJWT, getTickets );

// router.post('/:id', 
//             [
//                 //check('tipo_incidencia', 'El tipo de incidencia es obligatorio').not().isEmpty(),
//                 //validarCampos,
//             ],
//             crearTicket 
// );

// router.put('/', (req, resp, next) => {
//     resp.status(200).json({
//         ok: true,
//         mensaje: 'peticion realizada correctamente'
//     })
// });

router.put('/', 
            //[    
            //validarJWT,
            //check('nombre', 'El nombre es obligatorio').not().isEmpty(),
            //validarCampos,
            //],
            //validarJWT,
            cambiandoestadoTicket
);

// router.delete('/:id', 
//             validarJWT,
//             borrarInci 
// );

// router.get('/:id', 
//             //validarJWT,
//             getTicketByID 
// );

module.exports = router;