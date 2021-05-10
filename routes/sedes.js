
/*
    Ruta : /api/sedes
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { getSedes } = require('../controllers/sedes');


const router = Router();

router.get('/', validarJWT, getSedes );



module.exports = router;