
/*
    Ruta : /api/tickets_lista
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT, validarJWT_params } = require('../middlewares/validar-jwt');

const { getTicketByID } = require('../controllers/tickets_lista');
//const { getAreas, crearUsuario, actualizarUsuario, borrarUsuario, getUsuarioByID } = require('../controllers/areas');

const router = Router();

// router.get('/', validarJWT, getTickets );

// router.post('/', 
//             [
//                 //check('tipo_incidencia', 'El tipo de incidencia es obligatorio').not().isEmpty(),
//                 //validarCampos,
//             ],
//             crearTicket 
// );

// router.put('/:id', 
//             [    validarJWT,
//                  check('nombre', 'El nombre es obligatorio').not().isEmpty(),
//             validarCampos,
//             ],
//             actualizarArea
// );

// router.delete('/:id', 
//             validarJWT,
//             borrarInci 
// );

router.get('/', 
    validarJWT_params,
    getTicketByID 
);

module.exports = router;