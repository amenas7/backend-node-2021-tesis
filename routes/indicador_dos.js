
/*
    Ruta : /api/indicador_dos
*/

const { Router } = require('express');
const { check } = require ('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { getIndicador } = require('../controllers/indicador_dos');


const router = Router();

router.get('/', validarJWT, getIndicador );



module.exports = router;