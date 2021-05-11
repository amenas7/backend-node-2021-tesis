
/*
    Ruta : /api/guardarnavegador
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT, validarJWT_params } = require('../middlewares/validar-jwt');

const { savePush, } = require('../controllers/guardar_navegador');
//const { getAreas, crearUsuario, actualizarUsuario, borrarUsuario, getUsuarioByID } = require('../controllers/areas');

const router = Router();

// router.get('/', 
//     validarJWT,
//     //validarJWT_params,
//     getAreas );

router.post('/', 
            //[
                //check('nombre', 'El nombre es obligatorio').not().isEmpty(),
                //validarCampos,
            //],
            savePush 
);

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

module.exports = router;