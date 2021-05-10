const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener todos los roles activos
// ==========================================
const getSedes = (req, res) => {
    consql.query( 'SELECT IDsede, nombre, descripcion, estado FROM sede where estado = 1 ', (err, filas) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando sedes',
                errors: err
            })
        }
        if (!err) {
            return res.status(200).json({
                ok: true,
                sedes: filas,
                uid: req.uid
            })
        }
    });
}


module.exports = {
    getSedes

}