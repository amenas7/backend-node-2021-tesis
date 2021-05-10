const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener todos los estados de ticket
// ==========================================
const getEstadosTicket = (req, res) => {
    const condicion_role = req.query.urole;
    const uid = req.query.id;
    

    if ( condicion_role == 'ADMINISTRADOR' || condicion_role == 'COORDINADOR' ) {
        consql.query( `SELECT IDestado, nombre FROM estado_ticket WHERE IDestado != 1 
        AND IDestado != 2 AND IDestado != 6 `, (err, filas) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando estados',
                    errors: err
                })
            }
            if (!err) {
                return res.status(200).json({
                    ok: true,
                    estados: filas,
                    uid: req.uid
                })
            }
        });
    }

    else {
        consql.query( `SELECT IDestado, nombre FROM estado_ticket WHERE IDestado != 1 
        AND IDestado != 2 AND IDestado != 6 AND IDestado != 5 `, (err, filas) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando estados',
                    errors: err
                })
            }
            if (!err) {
                return res.status(200).json({
                    ok: true,
                    estados: filas,
                    uid: req.uid
                })
            }
        });
    }
    
}


module.exports = {
    getEstadosTicket

}