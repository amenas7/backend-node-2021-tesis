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

function consultar_role(req, res, p_idu) {
    const query = `
    SELECT 
    rol.nombre, usuario.usuarioID, persona.nombrecompleto
    from usuario
    inner join rol
    on rol.IDrol = usuario.IDrol
		inner join persona
		on persona.IDpersona = usuario.IDpersona
    where usuario.usuarioID = ${p_idu}
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

function consultar_detalle(req, res, p_idp) {
    const query = `
    SELECT 
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
            WHERE ticket.IDticket = ${ p_idp } AND historial_ticket.distintivo = 1 `;

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

    const p_idp = req.body.id;
    const p_idu = req.body.IDusuario;

    const consulta_uno = await consultar_role(req, res, p_idu);
    const p_nombre_especialista = consulta_uno[0].nombrecompleto;
    const p_rol = consulta_uno[0].nombre;

    const consulta_det = await consultar_detalle(req, res, p_idp);
    const p_detalle_ticket = consulta_det[0].detalle_ticket;
    // let arreglo = {
    //     uid: consulta[0].usuarioID,
    //     nombre: consulta[0].nombre_total,
    //     usuario: consulta[0].usuario,
    //     password: consulta[0].password,
    //     role: consulta[0].nombre_rol
    // }

    const query = `CALL USP_REG_TICKET_REASIGNAR( "${p_idp}", "${p_idu}", 
    "${p_nombre_especialista}", "${p_rol}", "${ p_detalle_ticket }" )  `;

    //console.log(query);

    const reg = await registrar(req, res, query);
    //console.log(reg);
    //console.log(reg);

    if (reg == '') {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al recrear ticket'
        })
    }

    const consulta = await consultar(req, res, reg);

    // crear token
    const token =  await generarJWT( consulta[0].IDusuario );

    // obtener ultimo registro
    ticket = await consultar_socket(req, res, reg, p_idu, p_rol);

    //console.log(consulta_socket);

    const server = Server.instance;
    //console.log('emitiendo...', ticket);
    server.io.emit('reasignarTicket', ticket );
    
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
function consultar_socket(req, res, reg, p_idu, p_rol ) {
    let query;
    if ( p_rol == 'ADMINISTRADOR' || p_rol == 'COORDINADOR' ) {
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
    else if ( p_rol == 'USUARIO' ){
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




module.exports = {
    //getTickets,
    crearTicket

}