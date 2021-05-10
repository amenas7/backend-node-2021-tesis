const bcrypt = require('bcrypt');

const { Server } = require('../sockets/server');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener un ticket por el role
// ==========================================
const getTickets = async(req, res) => {

    consql.query(`SELECT 
    ticket.serie, CONCAT(usuario.usuario, ' - ', ticket.nombre_persona) as usuario_completo, 
    tipos_inci.nombre_tipo_inci as Tipo, nombre_area as Area , historial_ticket.fecha_reg, 
    historial_ticket.detalle_ticket as Detalle, CASE
    WHEN historial_ticket.estado_ticket = 2 THEN 'ASIGNADA' 
    WHEN historial_ticket.estado_ticket = 3 THEN 'ATENDIENDOSE'
    WHEN historial_ticket.estado_ticket = 4 THEN 'FINALIZADA'
    WHEN historial_ticket.estado_ticket = 5 THEN 'RESUELTA'
    WHEN historial_ticket.estado_ticket = 6 THEN 'REABIERTA'
    END as estado, 
    prioridad.nombre_prioridad as Prioridad,
    concat(ticket.rol_esp_tmp,' - ',ticket.nombre_esp_tmp) as Especialista
    from ticket
    inner join historial_ticket
    on historial_ticket.ticketID = ticket.IDticket
    inner join tipos_inci
    on tipos_inci.IDtipos_inci = ticket.IDtipo_inci
    inner join usuario
    on usuario.IDpersona = ticket.IDpersona
    inner join prioridad
    on prioridad.IDprioridad = ticket.IDprioridad
    WHERE historial_ticket.distintivo = 1  
    order by historial_ticket.fecha_reg desc `, (err, ticket) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando ticket detalle',
                errors: err
            })
        }
        if (!err) {
            let ticket2 = {
                Serie: ticket[0].serie,
                Estado: ticket[0].serie,
                Usuario_Solicitante: ticket[0].serie,
                Area: ticket[0].serie,
                Tipo: ticket[0].serie
            }

            return res.status(200).json(ticket)
        }
    });
        
}

/*---------------------**/
function consultar_socket(req, res) {
    const query = `
    SELECT 
    ticket.IDticket as ticketid, IDtipo_inci, tipos_inci.nombre_tipo_inci, ticket.IDpersona,
    usuario.usuario, ticket.nombre_persona, ticket.serie,
    CONCAT(usuario.usuario, ' - ', ticket.nombre_persona) as usuario_completo, 
    nombre_area, historial_ticket.fecha_reg, historial_ticket.detalle_ticket,
    CASE
        WHEN ticket.estado_principal = 1 THEN 'PENDIENTE' 
        WHEN ticket.estado_principal = 2 THEN 'ASIGNADA' 
        WHEN ticket.estado_principal = 3 THEN 'ATENDIENDOSE'
        WHEN ticket.estado_principal = 4 THEN 'FINALIZADA'
        WHEN ticket.estado_principal = 5 THEN 'RESUELTA'
    END as estado_nombre, ticket.estado_principal as estado, ticket.IDprioridad, prioridad.nombre_prioridad,
    concat(historial_ticket.rol_name,' - ',historial_ticket.nombre_esp) as nombre_esp, historial_ticket.IDespecialista_u
    from ticket
    inner join historial_ticket
    on historial_ticket.ticketID = ticket.IDticket
    inner join tipos_inci
    on tipos_inci.IDtipos_inci = ticket.IDtipo_inci
    inner join usuario
    on usuario.IDpersona = ticket.IDpersona
    inner join prioridad
    on prioridad.IDprioridad = ticket.IDprioridad
    WHERE historial_ticket.distintivo = 1 order by historial_ticket.fecha_reg desc  
    `;

    //console.log(query);
    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}
/**-----------------------*/



module.exports = {
    getTickets
}