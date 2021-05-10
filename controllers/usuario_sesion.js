const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');



// ==========================================
// obtener un usuario por el ID de session
// ==========================================
const getUsuarioByID = (req, res) => {
    const id = req.params.id;
    consql.query(`select usuario.usuarioID, usuario.usuario, persona.nombrecompleto, persona.numdoc,
    area.nombre_area, persona.IDpersona
    from usuario
    inner join persona
    on persona.IDpersona = usuario.IDpersona
    inner join area
    on area.IDarea = usuario.IDarea 
    where usuario.usuarioID = ${ id } `, (err, filas) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuario',
                errors: err
            })
        }
        if (!err) {
            return res.status(200).json({
                ok: true,
                usuario: filas,
                uid: req.uid
            })
        }
    });
}


module.exports = {
    getUsuarioByID
}