
/*
    Ruta : /api/tickets
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { crearTicket, getTicketByID } = require('../controllers/tickets');
//const { getAreas, crearUsuario, actualizarUsuario, borrarUsuario, getUsuarioByID } = require('../controllers/areas');

const router = Router();

// router.get('/', validarJWT, getTickets );

router.post('/:id', 
            [
                //check('tipo_incidencia', 'El tipo de incidencia es obligatorio').not().isEmpty(),
                //validarCampos,
            ],
            crearTicket 
);

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

router.get('/:id', 
            //validarJWT,
            getTicketByID 
);

module.exports = router;