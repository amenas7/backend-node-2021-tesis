const bcrypt = require('bcrypt');



//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener todos las areas
// ==========================================
const getTipos = (req, res) => {
    consql.query(` SELECT IDtipos_inci as tipoincid, nombre_tipo_inci as nombre, descripcion from tipos_inci WHERE estado = 1`, (err, filas) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando tipos de incidencias',
                errors: err
            })
        }
        if (!err) {
            return res.status(200).json({
                ok: true,
                tipos: filas,
                aid: req.aid
            })
        }
    });
}





module.exports = {
    getTipos,
}