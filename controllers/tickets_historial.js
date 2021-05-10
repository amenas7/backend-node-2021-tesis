const bcrypt = require('bcrypt');


const { Server } = require('./../sockets/server');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener todos las incidencias
// ==========================================
// const getIncidencias = (req, res) => {
//     consql.query(` SELECT  
//     incidencia.IDincidencia as incidenciaid, IDtipo_inci, tipos_inci.nombre_tipo_inci, incidencia.IDpersona,
//     usuario.usuario, incidencia.nombre_persona, 
//     CONCAT(usuario.usuario, ' - ', incidencia.nombre_persona) as usuario_completo, 
//     nombre_area, incidencia.fecha_reg, detalle_inci,
//     CASE
//         WHEN incidencia.estado = 1 THEN 'Pendiente' 
//         WHEN incidencia.estado = 2 THEN 'Asignada'
//     END as estado_nombre, incidencia.estado
//     from incidencia
//     inner join tipos_inci
//     on tipos_inci.IDtipos_inci = incidencia.IDtipo_inci
//     inner join usuario
//     on usuario.IDpersona = incidencia.IDpersona
//     where incidencia.interno = 1 `, (err, filas) => {
//         if (err) {
//             return res.status(500).json({
//                 ok: false,
//                 mensaje: 'Error cargando las incidencias',
//                 errors: err
//             })
//         }
//         if (!err) {
//             return res.status(200).json({
//                 ok: true,
//                 incidencias: filas,
//                 aid: req.aid
//             })
//         }
//     });
// }

function consultar(req, res, reg) {
    const query = `
    SELECT 
    ticket.IDticket as ticketid, historial_ticket.historial_ticketID ,
    historial_ticket.fecha_reg, historial_ticket.detalle_ticket,
    historial_ticket.nombre_esp, historial_ticket.rol_name ,historial_ticket.IDespecialista_u as IDusuario,
    persona.email, historial_ticket.estado_ticket as estado,
    CASE
        WHEN historial_ticket.estado_ticket = 1 THEN 'PENDIENTE'
        WHEN historial_ticket.estado_ticket = 2 THEN 'ASIGNADA' 
        WHEN historial_ticket.estado_ticket = 3 THEN 'ATENDIENDOSE'
        WHEN historial_ticket.estado_ticket = 4 THEN 'FINALIZADA'
        WHEN historial_ticket.estado_ticket = 5 THEN 'RESUELTA'
        WHEN historial_ticket.estado_ticket = 6 THEN 'REABIERTA'
    END as estado_nombre
    from ticket
    inner join historial_ticket
    on historial_ticket.ticketID = ticket.IDticket
    inner join usuario
    on usuario.IDpersona = ticket.IDpersona
    inner join persona
    on persona.IDpersona = ticket.IDpersona
    WHERE historial_ticket.historial_ticketID = ${reg} `;

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

// ==========================================
// crear una historial nuevo al ticket
// ==========================================
const crearTicketHistorial = async(req, res) => {

    const p_id = req.body.id;
    const p_idu = req.body.idu;
    const p_urole = req.body.urole;
    const p_estado_ticket = req.body.estado_ticket;
    const p_detalle = req.body.detalle;

    //console.log('id de ticket', p_id);
    //console.log('id de usuario', p_idu);
    //console.log('role del usuario', p_urole);
    // const p_nombre_persona = req.body.usuario_nombre;
    // const p_nombre_area_usuario = req.body.nombre_area_usuario;
    // const p_tipo_incidencia = req.body.tipo_incidencia;
    // const p_detalle = req.body.detalle;

    const query = `CALL USP_REG_HISTORIAL_TICKET( "${p_id}", "${p_idu}", "${p_estado_ticket}", 
    "${p_detalle}" )  `;

    //console.log(query);

    const reg = await registrar(req, res, query);
    //console.log(reg);
    //console.log(reg);

    if (reg == '') {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al crear historia de ticket'
        })
    }

    const consulta = await consultar(req, res, reg);
    // let arreglo = {
    //     uid: consulta[0].usuarioID,
    //     nombre: consulta[0].nombre_total,
    //     usuario: consulta[0].usuario,
    //     password: consulta[0].password,
    //     role: consulta[0].nombre_rol
    // }

    // crear token
    const token =  await generarJWT( consulta[0].IDusuario );

    //console.log('id ticket consultado', p_id);

    const consulta_socket = await consultar_socket(req, res, p_id, p_urole, p_idu);
    //console.log(consulta_socket);

    const server = Server.instance;
    server.io.emit('updateTicket', consulta_socket );
    
    res.status(201).json({
        ticket: consulta_socket,
        //usuario: arreglo,
        //usuariotoken: req.usuario,
        token
    });
}

function registrar(req, res, query) {
    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            //console.log(rows[0][0]);
            //console.log(rows[0].idp);
            resolve(rows[0][0].idp);
        });
    });
}

/*---------------------**/
function consultar_socket(req, res, p_id, p_urole, p_idu) {
    let query;

    if ( p_urole == 'ADMINISTRADOR' || p_urole == 'COORDINADOR' ) {
        query = `
        SELECT 
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
        WHERE historial_ticket.distintivo = 1 AND ticket.IDticket = ${ p_id }
        order by historial_ticket.fecha_reg desc  
        `;
    }
    else if ( p_urole == 'USUARIO' ){
        query = `
        SELECT 
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
         AND ticket.IDticket = ${ p_id } AND ticket.IDusuario = ${ p_idu } 
         order by historial_ticket.fecha_reg desc  
    `;
    }
    else {
        query = `
        SELECT 
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
        AND ticket.id_esp_tmp = ${ p_idu } 
        order by historial_ticket.fecha_reg desc  
    `;
    }
    
    //console.log(query);
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
// // ==========================================
// // borrar una incidencia
// // ==========================================
// const borrarInci = async(req, res = response) => {
//     const reg = req.params.id;

//     const obtenerReg = await consultar(req, res, reg);
//     if (obtenerReg == '') {
//         return res.status(500).json({
//             ok: false,
//             mensaje: 'Error incidencia no encontrado'
//         })
//     }

//     const actualizareg = await eliminar(req, res, reg);
//     if (actualizareg.insertId != '0') {
//         return res.status(400).json({
//             ok: false,
//             mensaje: 'Error al actualizar incidencia'
//         });
//     }
//     else{
//         res.status(200).json({
//             ok: true,
//             mensaje: "Incidenciarea eliminada"
//         });
//     }
// }

// function eliminar(req, res, reg) {
//     const p_id = reg;

//     const query = `
//     UPDATE incidencia
//     SET interno = 0
//     WHERE IDincidencia = "${p_id}"
//     `;
//     return new Promise((resolve, reject) => {
//         consql.query(query, (err, rows, fields) => {
//             if (err) {
//                 return reject(err);
//             }
//             resolve(rows);
//         });
//     });
// }

// ==========================================
// obtener historial de tickets por el ID
// ==========================================
const getTicketsHistorial = (req, res) => {
    const id = req.params.id;
    consql.query(`SELECT 
    ticket.IDticket as ticketid, historial_ticket.historial_ticketID ,
    historial_ticket.fecha_reg, historial_ticket.detalle_ticket,
    historial_ticket.nombre_esp, historial_ticket.rol_name ,historial_ticket.IDespecialista_u,
    persona.email, historial_ticket.estado_ticket as estado,
    CASE
        WHEN historial_ticket.estado_ticket = 1 THEN 'PENDIENTE' 
        WHEN historial_ticket.estado_ticket = 2 THEN 'ASIGNADA' 
        WHEN historial_ticket.estado_ticket = 3 THEN 'ATENDIENDOSE'
        WHEN historial_ticket.estado_ticket = 4 THEN 'FINALIZADA'
        WHEN historial_ticket.estado_ticket = 5 THEN 'RESUELTA'
        WHEN historial_ticket.estado_ticket = 6 THEN 'REABIERTA'
    END as estado_nombre, historial_ticket.distintivo
    from ticket
    inner join historial_ticket
    on historial_ticket.ticketID = ticket.IDticket
    inner join usuario
    on usuario.IDpersona = ticket.IDpersona
    inner join persona
    on persona.IDpersona = ticket.IDpersona
    WHERE ticket.IDticket = ${ id } 
    ORDER BY historial_ticket.fecha_reg DESC `, (err, filas) => {
    //WHERE ticket.IDticket = ${ id } AND historial_ticket.distintivo = 2 `, (err, filas) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando historial de tickets',
                errors: err
            })
        }
        if (!err) {
            return res.status(200).json({
                ok: true,
                historial: filas,
                aid: req.aid
            })
        }
    });
}
module.exports = {
    //getIncidencias,
    //borrarInci,
    //crearInci,
    getTicketsHistorial,
    crearTicketHistorial
}