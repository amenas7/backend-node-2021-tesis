
/*
    Ruta : /api/send
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT, validarJWT_params } = require('../middlewares/validar-jwt');

const { sendPush  } = require('../controllers/notificaciones');

const router = Router();

router.post('/', sendPush 
);

module.exports = router;


// router.get('/', 
//     validarJWT,
//     //validarJWT_params,
//     getAreas );



// router.put('/:id', 
//             [    //validarJWT,
//                  check('nombre', 'El nombre es obligatorio').not().isEmpty(),
//             validarCampos,
//             ],
//             actualizarArea
// );

// router.delete('/:id', 
//             //validarJWT,
//             validarJWT,
//             borrarArea 
// );

// router.get('/:id', 
//             //validarJWT,
//             validarJWT,
//             getAreaByID 
// );

