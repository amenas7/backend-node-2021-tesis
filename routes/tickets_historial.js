
/*
    Ruta : /api/tickets_historial
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { getTicketsHistorial, crearTicketHistorial } = require('../controllers/tickets_historial');
//const { getAreas, crearUsuario, actualizarUsuario, borrarUsuario, getUsuarioByID } = require('../controllers/areas');

const router = Router();

//router.get('/', validarJWT, getIncidencias );

router.post('/', 
            [
                //check('tipo_incidencia', 'El tipo de incidencia es obligatorio').not().isEmpty(),
                //validarCampos,
            ],
            crearTicketHistorial 
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
            getTicketsHistorial 
);

module.exports = router;