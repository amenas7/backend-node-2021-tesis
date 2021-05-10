const bcrypt = require('bcrypt');

const { Server } = require('./../sockets/server');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');



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
const cambiandoestadoTicket = async(req, res) => {
    //const uid = req.params.id;
    //console.log(uid);

    const p_id = req.body.id;
    const p_idu = req.body.IDusuario;
    const p_urole = req.body.role;
    const p_detalle = req.body.detalle_usuario;
    const p_nombre_especialista = req.body.nombre_especialista_temporal;

    // console.log('idticket', p_id);
    // console.log('idusuario', p_idu);
    // console.log('role', p_urole);
    // console.log('detalle', p_detalle);

    const query = `CALL USP_TICKET_REABIERTO( "${p_id}", "${p_detalle}", "${p_idu}", 
    "${p_nombre_especialista}", "${p_urole}" )  `;

    //console.log(query);

    const reg = await registrar(req, res, query);

    if (reg == '') {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al crear ticket'
        })
    }

    const consulta = await consultar(req, res, reg);

    // crear token
    const token =  await generarJWT( consulta[0].IDusuario );

    // obtener ultimo registro
    ticket = await consultar_socket(req, res, reg, p_idu, p_urole);

    //console.log(consulta_socket);

    const server = Server.instance;
    //console.log('emitiendo...', ticket);
    server.io.emit('updateTicket', ticket );
    
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
function consultar_socket(req, res, reg, p_idu, p_urole ) {
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
        WHERE historial_ticket.distintivo = 1 AND ticket.IDticket = ${ reg }
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



module.exports = {
    //getTickets,
    //borrarInci,
    cambiandoestadoTicket,
    //getTicketByID
}