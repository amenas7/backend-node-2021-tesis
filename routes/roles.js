
/*
    Ruta : /api/roles
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { getRoles } = require('../controllers/roles');


const router = Router();

router.get('/', validarJWT, getRoles );



module.exports = router;