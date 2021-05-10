
/*
    Ruta : /api/inci_ticket
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT, validarJWT_params } = require('../middlewares/validar-jwt');

const { getInciByID } = require('../controllers/inci_ticket');
//const { getUsuarios, crearUsuario, actualizarUsuario, borrarUsuario, getUsuarioByID } = require('../controllers/usuarios');

const router = Router();

//router.get('/', validarJWT, getUsuarios );


router.get('/:id', 
            validarJWT,
            //validarJWT_params,
            getInciByID 
);

module.exports = router;