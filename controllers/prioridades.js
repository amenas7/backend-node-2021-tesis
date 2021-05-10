const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');



// ==========================================
// obtener una incidencia desde el modulo anterior
// ==========================================
const getPrioridades = (req, res) => {
    consql.query(`SELECT 
    IDprioridad, nombre_prioridad, descripcion_prioridad, estado_prioridad
    from prioridad `, (err, filas) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando prioridades',
                errors: err
            })
        }
        if (!err) {
            return res.status(200).json({
                ok: true,
                prioridad: filas,
                uid: req.uid
            })
        }
    });
}


module.exports = {
    getPrioridades
}