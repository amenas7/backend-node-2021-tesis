const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener listado del primer indicador
// ==========================================
const getIndicador = (req, res) => {
    consql.query( `SELECT 
    cast( historial_ticket.fecha_reg as date ) as fecha,
    count( case when ticket.estado_principal = 5 and historial_ticket.distintivo = '1' then 1 end ) as resuelto,
    count( case when historial_ticket.distintivo = '1' then 1 end ) as total,
    round(count(case when ticket.estado_principal = 5 and historial_ticket.distintivo = '1' then 1 end) 
     / count( case when historial_ticket.distintivo = '1' then 1 end ) * 100, 2) as indicador
    from ticket
    inner join historial_ticket
    on historial_ticket.ticketID = ticket.IDticket
    group by cast( historial_ticket.fecha_reg as date )` , (err, filas) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando indicador',
                errors: err
            })
        }
        if (!err) {
            return res.status(200).json({
                ok: true,
                indicador: filas,
                uid: req.uid
            })
        }
    });
}


module.exports = {
    getIndicador

}