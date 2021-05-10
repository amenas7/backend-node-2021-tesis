const bcrypt = require('bcrypt');

const { Server } = require('./../sockets/server');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener todos las incidencias
// ==========================================
const getIncidencias = (req, res) => {
    consql.query(` SELECT  
    incidencia.IDincidencia as incidenciaid, IDtipo_inci, tipos_inci.nombre_tipo_inci, incidencia.IDpersona,
    incidencia.IDusuario ,usuario.usuario, incidencia.nombre_persona, 
    CONCAT(usuario.usuario, ' - ', incidencia.nombre_persona) as usuario_completo, 
    nombre_area, incidencia.fecha_reg, detalle_inci,
    CASE
        WHEN incidencia.estado = 1 THEN 'Pendiente' 
        WHEN incidencia.estado = 2 THEN 'Asignada'
    END as estado_nombre, incidencia.estado
    from incidencia
    inner join tipos_inci
    on tipos_inci.IDtipos_inci = incidencia.IDtipo_inci
    inner join usuario
    on usuario.IDpersona = incidencia.IDpersona
    where incidencia.interno = 1 ORDER BY incidencia.fecha_reg desc `, (err, filas) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando las incidencias',
                errors: err
            })
        }
        if (!err) {
            return res.status(200).json({
                ok: true,
                incidencias: filas,
                aid: req.aid
            })
        }
    });
}

function consultar(req, res, reg) {
    const query = `
    SELECT  
    incidencia.IDincidencia , IDtipo_inci, tipos_inci.nombre_tipo_inci, incidencia.IDpersona, incidencia.IDusuario ,
    usuario.usuario, incidencia.nombre_persona, 
    CONCAT(usuario.usuario, ' - ', incidencia.nombre_persona) as usuario_completo, 
    nombre_area, incidencia.fecha_reg, detalle_inci,
    CASE
        WHEN incidencia.estado = 1 THEN 'Pendiente' 
        WHEN incidencia.estado = 2 THEN 'Asignada'
    END as estado
    from incidencia
    inner join tipos_inci
    on tipos_inci.IDtipos_inci = incidencia.IDtipo_inci
    inner join usuario
    on usuario.IDpersona = incidencia.IDpersona
    where incidencia.IDincidencia = ${reg} AND incidencia.interno = 1  
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

function consultar_socket(req, res, reg) {
    const query = `
    SELECT  
    incidencia.IDincidencia as incidenciaid, IDtipo_inci, tipos_inci.nombre_tipo_inci, incidencia.IDpersona,
    incidencia.IDusuario ,usuario.usuario, incidencia.nombre_persona, 
    CONCAT(usuario.usuario, ' - ', incidencia.nombre_persona) as usuario_completo, 
    nombre_area, incidencia.fecha_reg, detalle_inci,
    CASE
        WHEN incidencia.estado = 1 THEN 'Pendiente' 
        WHEN incidencia.estado = 2 THEN 'Asignada'
    END as estado_nombre, incidencia.estado
    from incidencia
    inner join tipos_inci
    on tipos_inci.IDtipos_inci = incidencia.IDtipo_inci
    inner join usuario
    on usuario.IDpersona = incidencia.IDpersona
    where incidencia.interno = 1 AND incidencia.IDincidencia = ${reg} `;
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
// crear una incidencia
// ==========================================
const crearInci = async(req, res) => {

    const p_idp = req.body.idp;
    const p_idu = req.body.idu;
    const p_usuario = req.body.usuario;
    const p_nombre_persona = req.body.usuario_nombre;
    const p_nombre_area_usuario = req.body.nombre_area_usuario;
    const p_tipo_incidencia = req.body.tipo_incidencia;
    const p_detalle = req.body.detalle;

    const query = `CALL USP_REG_INCIDENCIA( "${p_tipo_incidencia}", "${p_idp}", "${p_nombre_persona}", 
    "${p_idu}", "${p_usuario}", "${p_nombre_area_usuario}" , "${p_detalle}" )  `;

    //console.log(query);

    const reg = await registrar(req, res, query);
    //console.log(reg);
    //console.log(reg);

    if (reg == '') {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al crear incidencia'
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

    // obtener ultimo registro
    incidencia = await consultar_socket(req, res, reg);

    const server = Server.instance;
    //console.log('emitiendo...', ticket);
    server.io.emit('nueva-inci', incidencia );
    
    res.status(201).json({
        ok: true,
        incidencia: incidencia,
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
    getIncidencias,
    borrarInci,
    crearInci,
}