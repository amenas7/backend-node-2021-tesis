const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener todos los roles activos
// ==========================================
const getRoles = (req, res) => {
    consql.query( 'SELECT IDrol, descripcion, estado FROM rol where estado = 1 ', (err, filas) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando roles',
                errors: err
            })
        }
        if (!err) {
            return res.status(200).json({
                ok: true,
                roles: filas,
                uid: req.uid
            })
        }
    });
}


module.exports = {
    getRoles

}