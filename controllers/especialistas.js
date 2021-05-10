const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');



// ==========================================
// obtener una incidencia desde el modulo anterior
// ==========================================
const getEspecialistas= (req, res) => {
    consql.query(`SELECT 
    CONCAT(rol.nombre, ' - ', persona.nombrecompleto) as nombre_total, rol.descripcion ,usuario.IDrol, persona.IDpersona, 
    usuario.usuarioID as uid
    FROM
    usuario
    inner join persona
    on persona.IDpersona = usuario.IDpersona
    inner join rol
    on rol.IDrol = usuario.IDrol
    where usuario.estado = 1  and usuario.IDrol != 1 and usuario.IDrol != 5 `, (err, filas) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando incidencia',
                errors: err
            })
        }
        if (!err) {
            return res.status(200).json({
                ok: true,
                usuarios: filas,
                uid: req.uid
            })
        }
    });
}


module.exports = {
    getEspecialistas
}