
/*
    Ruta : /api/tipos_inci
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { getTipos } = require('../controllers/tipos_inci');
//const { getAreas, crearUsuario, actualizarUsuario, borrarUsuario, getUsuarioByID } = require('../controllers/areas');

const router = Router();

//router.get('/', validarJWT, getTipos );
router.get('/', getTipos );

// router.post('/', 
//             [
//                 check('nombre', 'El nombre es obligatorio').not().isEmpty(),
//                 validarCampos,
//             ],
//             crearArea 
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
//             borrarArea 
// );

// router.get('/:id', 
//             validarJWT,
//             getAreaByID 
// );

module.exports = router;