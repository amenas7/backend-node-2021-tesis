const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');



// ==========================================
// obtener una incidencia desde el modulo anterior
// ==========================================
const getInciByID = (req, res) => {
    const id = req.params.id;
    consql.query(`SELECT  
    incidencia.IDincidencia as incidenciaid, IDtipo_inci, tipos_inci.nombre_tipo_inci,
    incidencia.IDusuario, usuario.usuario, incidencia.IDpersona, incidencia.nombre_persona, 
    CONCAT(usuario.usuario, ' - ', incidencia.nombre_persona) as usuario_completo, 
    nombre_area, incidencia.fecha_reg, detalle_inci, persona.email
    from incidencia
    inner join tipos_inci
    on tipos_inci.IDtipos_inci = incidencia.IDtipo_inci
    inner join persona
    on persona.IDpersona = incidencia.IDpersona
		inner join usuario
		on usuario.usuarioID = incidencia.IDusuario
    where incidencia.interno = 1 and incidencia.IDincidencia = ${ id } `, (err, filas) => {
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
                ticket: filas,
                uid: req.uid
            })
        }
    });
}


module.exports = {
    getInciByID
}