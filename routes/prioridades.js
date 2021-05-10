
/*
    Ruta : /api/prioridades
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { getPrioridades } = require('../controllers/prioridades');
//const { getUsuarios, crearUsuario, actualizarUsuario, borrarUsuario, getUsuarioByID } = require('../controllers/usuarios');

const router = Router();

router.get('/', 
    validarJWT,
    //validarJWT_params,
    getPrioridades );


// router.get('/:id', 
//             //validarJWT,
//             getInciByID 
// );

module.exports = router;