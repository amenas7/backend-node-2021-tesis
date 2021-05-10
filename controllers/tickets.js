const bcrypt = require('bcrypt');

const { Server } = require('./../sockets/server');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener todos los tickets
// ==========================================
// const getTickets = (req, res) => {
//     consql.query(` SELECT 
//     ticket.IDticket as ticketid, IDtipo_inci, tipos_inci.nombre_tipo_inci, ticket.IDpersona,
//     usuario.usuario, ticket.nombre_persona, ticket.serie,
//     CONCAT(usuario.usuario, ' - ', ticket.nombre_persona) as usuario_completo, 
//     nombre_area, historial_ticket.fecha_reg, historial_ticket.detalle_ticket,
//     CASE
//         WHEN ticket.estado_principal = 1 THEN 'PENDIENTE' 
//         WHEN ticket.estado_principal = 2 THEN 'ASIGNADA' 
//         WHEN ticket.estado_principal = 3 THEN 'ATENDIENDOSE'
//         WHEN ticket.estado_principal = 4 THEN 'FINALIZADA'
//         WHEN ticket.estado_principal = 5 THEN 'RESUELTA'
//     END as estado_nombre, ticket.estado_principal as estado, ticket.IDprioridad, prioridad.nombre_prioridad,
//     concat(ticket.rol_esp_tmp,' - ',ticket.nombre_esp_tmp) as nombre_esp, ticket.id_esp_tmp as IDespecialista_u
//     from ticket
//     inner join historial_ticket
//     on historial_ticket.ticketID = ticket.IDticket
//     inner join tipos_inci
//     on tipos_inci.IDtipos_inci = ticket.IDtipo_inci
//     inner join usuario
//     on usuario.IDpersona = ticket.IDpersona
//     inner join prioridad
//     on prioridad.IDprioridad = ticket.IDprioridad
//     WHERE historial_ticket.distintivo = 1 order by historial_ticket.fecha_reg desc
//      `, (err, filas) => {
//         if (err) {
//             return res.status(500).json({
//                 ok: false,
//                 mensaje: 'Error cargando los tickets',
//                 errors: err
//             })
//         }
//         if (!err) {
//             return res.status(200).json({
//                 ok: true,
//                 tickets: filas,
//                 aid: req.aid
//             })
//         }
//     });
// }

// ==========================================
// obtener un ticket por el ID
// ==========================================
const getTicketByID = (req, res) => {
    const id = req.params.id;
    consql.query(`SELECT 
    ticket.IDticket as ticketid, IDtipo_inci, tipos_inci.nombre_tipo_inci, ticket.IDpersona,
    usuario.usuario, ticket.nombre_persona, ticket.serie,
    CONCAT(usuario.usuario, ' - ', ticket.nombre_persona) as usuario_completo, 
    nombre_area, historial_ticket.fecha_reg, historial_ticket.detalle_ticket,
    CASE
        WHEN historial_ticket.estado_ticket = 1 THEN 'Pendiente' 
        WHEN historial_ticket.estado_ticket = 2 THEN 'Registrada'
    END as estado, ticket.IDprioridad, prioridad.nombre_prioridad,
    historial_ticket.nombre_esp, historial_ticket.IDespecialista_u,
            persona.email
    from ticket
    inner join historial_ticket
    on historial_ticket.ticketID = ticket.IDticket
    inner join tipos_inci
    on tipos_inci.IDtipos_inci = ticket.IDtipo_inci
    inner join usuario
    on usuario.IDpersona = ticket.IDpersona
        inner join prioridad
        on prioridad.IDprioridad = ticket.IDprioridad
            inner join persona
            on persona.IDpersona = ticket.IDpersona
            WHERE ticket.IDticket = ${ id } AND historial_ticket.distintivo = 1 `, (err, filas) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando ticket detalle',
                errors: err
            })
        }
        if (!err) {
            return res.status(200).json({
                ok: true,
                ticket: filas
            })
        }
    });
}

function consultar_role(req, res, p_idp) {
    const query = `
    SELECT 
    rol.nombre as nombre_rol
    from usuario
    inner join rol
    on rol.IDrol = usuario.IDrol
    where usuario.usuarioID = ${p_idp}
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

function consultar(req, res, reg) {
    const query = `
    SELECT  
    ticket.IDticket as ticketid, IDtipo_inci, tipos_inci.nombre_tipo_inci, ticket.IDpersona,
    usuario.usuario, ticket.nombre_persona, ticket.serie,
    CONCAT(usuario.usuario, ' - ', ticket.nombre_persona) as usuario_completo, 
    nombre_area, historial_ticket.fecha_reg, historial_ticket.detalle_ticket,
		ticket.IDprioridad, prioridad.nombre_prioridad, usuario.usuarioID as IDusuario
    from ticket
		inner join historial_ticket
    on historial_ticket.ticketID = ticket.IDticket
    inner join tipos_inci
    on tipos_inci.IDtipos_inci = ticket.IDtipo_inci
    inner join usuario
    on usuario.IDpersona = ticket.IDpersona
		inner join prioridad
		on prioridad.IDprioridad = ticket.IDprioridad
    where ticket.IDticket = ${reg} AND historial_ticket.interno = 1  
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

// ==========================================
// crear un ticket
// ==========================================
const crearTicket = async(req, res) => {
    //const uid = req.params.id;
    //console.log(uid);

    const p_idp = req.body.idp;
    const p_idu = req.body.idu;
    const p_usuario = req.body.usuario;
    const p_nombre_persona = req.body.usuario_nombre;
    const p_nombre_area_usuario = req.body.nombre_area_usuario;
    const p_tipo_incidencia = req.body.IDtipoinci;
    const p_detalle = req.body.detalle;
    const p_especialista = req.body.especialista;
    const p_prioridad = req.body.tipo_prioridad;
    const p_incidenciaid = req.body.incidenciaid;

    const query = `CALL USP_REG_TICKET( "${p_tipo_incidencia}", "${p_idp}", "${p_nombre_persona}", 
    "${p_idu}", "${p_usuario}", "${p_nombre_area_usuario}" , "${p_detalle}", "${p_especialista}", "${p_prioridad}", 
    "${p_incidenciaid}" )  `;

    //console.log(query);

    const reg = await registrar(req, res, query);
    //console.log(reg);
    //console.log(reg);

    if (reg == '') {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al crear ticket'
        })
    }

    const consulta_role = await consultar_role(req, res, p_idu);
    const condicion_role = consulta_role[0].nombre_rol;
    //console.log(condicion_role);

    const consulta = await consultar(req, res, reg);

    // crear token
    const token =  await generarJWT( consulta[0].IDusuario );

    // obtener ultimo registro
    ticket = await consultar_socket(req, res, reg, p_idu, condicion_role);

    //console.log(consulta_socket);

    const server = Server.instance;
    //console.log('emitiendo...', ticket);
    server.io.emit('nuevoTicket', ticket );
    
    // res.status(201).json({
    //     ok: true,
    //     tickets: consulta_socket,
    //     //usuario: arreglo,
    //     //usuariotoken: req.usuario,
    //     token
    // });

    //console.log(tickets);
    return res.status(201).json({
        ticket: ticket,
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
function consultar_socket(req, res, reg, p_idu, condicion_role ) {
    let query;
    if ( condicion_role == 'ADMINISTRADOR' || condicion_role == 'COORDINADOR' ) {
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
        WHERE historial_ticket.distintivo = 1 AND ticket.IDticket = ${ reg }
        order by historial_ticket.fecha_reg desc  
        `;
    }
    else if ( condicion_role == 'USUARIO' ){
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
         AND ticket.IDticket = ${ reg } AND ticket.IDusuario = ${ p_idu }
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
        AND ticket.IDticket = ${ reg }
        order by historial_ticket.fecha_reg desc  
    `;
    }
    // query = `
    // SELECT 
    // ticket.IDticket as ticketid, IDtipo_inci, tipos_inci.nombre_tipo_inci, ticket.IDpersona,
    // usuario.usuario, ticket.nombre_persona, ticket.serie,
    // CONCAT(usuario.usuario, ' - ', ticket.nombre_persona) as usuario_completo, 
    // nombre_area, historial_ticket.fecha_reg, historial_ticket.detalle_ticket,
    // CASE
    //     WHEN ticket.estado_principal = 1 THEN 'PENDIENTE' 
    //     WHEN ticket.estado_principal = 2 THEN 'ASIGNADA' 
    //     WHEN ticket.estado_principal = 3 THEN 'ATENDIENDOSE'
    //     WHEN ticket.estado_principal = 4 THEN 'FINALIZADA'
    //     WHEN ticket.estado_principal = 5 THEN 'RESUELTA'
    // END as estado_nombre, ticket.estado_principal as estado, ticket.IDprioridad, prioridad.nombre_prioridad,
    // concat(ticket.rol_esp_tmp,' - ',ticket.nombre_esp_tmp) as nombre_esp, ticket.id_esp_tmp as IDespecialista_u
    // from ticket
    // inner join historial_ticket
    // on historial_ticket.ticketID = ticket.IDticket
    // inner join tipos_inci
    // on tipos_inci.IDtipos_inci = ticket.IDtipo_inci
    // inner join usuario
    // on usuario.IDpersona = ticket.IDpersona
    // inner join prioridad
    // on prioridad.IDprioridad = ticket.IDprioridad
    // WHERE historial_ticket.distintivo = 1 AND ticket.IDticket = ${ reg }
    // order by historial_ticket.fecha_reg desc  
    //     `;
    //console.log(query);
    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
            //console.log(rows);
        });
    });
}


function consultar_socket_parametro(req, res, uid) {
    

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
// ==========================================
// borrar una incidencia
// ==========================================
const borrarInci = async(req, res = response) => {
    const reg = req.params.id;

    const obtenerReg = await consultar(req, res, reg);
    if (obtenerReg == '') {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error incidencia no encontrado'
        })
    }

    const actualizareg = await eliminar(req, res, reg);
    if (actualizareg.insertId != '0') {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar incidencia'
        });
    }
    else{
        res.status(200).json({
            ok: true,
            mensaje: "Incidenciarea eliminada"
        });
    }
}

function eliminar(req, res, reg) {
    const p_id = reg;

    const query = `
    UPDATE incidencia
    SET interno = 0
    WHERE IDincidencia = "${p_id}"
    `;
    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}


module.exports = {
    //getTickets,
    borrarInci,
    crearTicket,
    getTicketByID
}