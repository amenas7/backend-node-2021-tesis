const bcrypt = require('bcrypt');

const { Server } = require('../sockets/server');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener un ticket por el role
// ==========================================
const getTicketByID = async(req, res) => {
    //const uid = req.params.id;
    const uid = req.query.id;
    const condicion_role = req.query.urole;

    if ( condicion_role == 'ADMINISTRADOR' || condicion_role == 'COORDINADOR' ) {
        consql.query(`SELECT 
        ticket.IDticket as ticketid, IDtipo_inci, tipos_inci.nombre_tipo_inci, ticket.IDpersona,
        usuario.usuario, ticket.IDusuario, ticket.nombre_persona, ticket.serie,
        CONCAT(usuario.usuario, ' - ', ticket.nombre_persona) as usuario_completo, 
        nombre_area, historial_ticket.fecha_reg, historial_ticket.detalle_ticket,
        CASE
            WHEN ticket.estado_principal = 1 THEN 'PENDIENTE' 
            WHEN ticket.estado_principal = 2 THEN 'ASIGNADA' 
            WHEN ticket.estado_principal = 3 THEN 'ATENDIENDOSE'
            WHEN ticket.estado_principal = 4 THEN 'FINALIZADA'
            WHEN ticket.estado_principal = 5 THEN 'RESUELTA'
            WHEN ticket.estado_principal = 6 THEN 'REABIERTA'
        END as estado_nombre, ticket.estado_principal as estado, ticket.IDprioridad, prioridad.nombre_prioridad,
        concat(ticket.rol_esp_tmp,' - ',ticket.nombre_esp_tmp) as nombre_esp, ticket.id_esp_tmp as IDespecialista_u
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
                return res.status(200).json(ticket)
            }
        });
    }

    else if ( condicion_role == 'USUARIO' ){
        consql.query(`SELECT 
         ticket.IDticket as ticketid, IDtipo_inci, tipos_inci.nombre_tipo_inci, ticket.IDpersona,
         usuario.usuario, ticket.IDusuario, ticket.nombre_persona, ticket.serie,
         CONCAT(usuario.usuario, ' - ', ticket.nombre_persona) as usuario_completo, 
         nombre_area, historial_ticket.fecha_reg, historial_ticket.detalle_ticket,
         CASE
             WHEN ticket.estado_principal = 1 THEN 'PENDIENTE' 
             WHEN ticket.estado_principal = 2 THEN 'ASIGNADA' 
             WHEN ticket.estado_principal = 3 THEN 'ATENDIENDOSE'
             WHEN ticket.estado_principal = 4 THEN 'FINALIZADA'
             WHEN ticket.estado_principal = 5 THEN 'RESUELTA'
             WHEN ticket.estado_principal = 6 THEN 'REABIERTA'
         END as estado_nombre, ticket.estado_principal as estado, ticket.IDprioridad, prioridad.nombre_prioridad,
         concat(ticket.rol_esp_tmp,' - ',ticket.nombre_esp_tmp) as nombre_esp, ticket.id_esp_tmp as IDespecialista_u
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
         AND ticket.IDusuario = ${ uid } 
         order by historial_ticket.fecha_reg desc `, (err, ticket) => {
             //console.log(ya);
             if (err) {
                 console.log(err);
                 return res.status(500).json({
                     ok: false,
                     mensaje: 'Error cargando tickes listado',
                     errors: err
                 })
             }
             if (!err) {
                 return res.status(200).json(ticket)
             }
         });
     }

    else {
       consql.query(`SELECT 
        ticket.IDticket as ticketid, IDtipo_inci, tipos_inci.nombre_tipo_inci, ticket.IDpersona,
        usuario.usuario, ticket.IDusuario, ticket.nombre_persona, ticket.serie,
        CONCAT(usuario.usuario, ' - ', ticket.nombre_persona) as usuario_completo, 
        nombre_area, historial_ticket.fecha_reg, historial_ticket.detalle_ticket,
        CASE
            WHEN ticket.estado_principal = 1 THEN 'PENDIENTE' 
            WHEN ticket.estado_principal = 2 THEN 'ASIGNADA' 
            WHEN ticket.estado_principal = 3 THEN 'ATENDIENDOSE'
            WHEN ticket.estado_principal = 4 THEN 'FINALIZADA'
            WHEN ticket.estado_principal = 5 THEN 'RESUELTA'
            WHEN ticket.estado_principal = 6 THEN 'REABIERTA'
        END as estado_nombre, ticket.estado_principal as estado, ticket.IDprioridad, prioridad.nombre_prioridad,
        concat(ticket.rol_esp_tmp,' - ',ticket.nombre_esp_tmp) as nombre_esp, ticket.id_esp_tmp as IDespecialista_u
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
        AND ticket.id_esp_tmp = ${ uid } 
        order by historial_ticket.fecha_reg desc `, (err, ticket) => {
            //console.log(ya);
            if (err) {
                console.log(err);
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando tickes listado',
                    errors: err
                })
            }
            if (!err) {
                return res.status(200).json(ticket)
            }
        });
    }

    
    
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
        WHEN ticket.estado_principal = 6 THEN 'REABIERTA'
    END as estado_nombre, ticket.estado_principal as estado, ticket.IDprioridad, prioridad.nombre_prioridad,
    concat(ticket.rol_esp_tmp,' - ',ticket.nombre_esp_tmp) as nombre_esp, ticket.id_esp_tmp as IDespecialista_u
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
    getTicketByID
}