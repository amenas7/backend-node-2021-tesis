const bcrypt = require('bcrypt');

const { Server } = require('./../sockets/server');


//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener todos las areas
// ==========================================
const getAreas = (req, res) => {
    consql.query(` SELECT IDarea as areaid, nombre_area, descripcion, estado from area WHERE estado = 1`, (err, filas) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando areas',
                errors: err
            })
        }
        if (!err) {
            return res.status(200).json({
                ok: true,
                areas: filas,
                aid: req.aid
            })
        }
    });
}

// ==========================================
// obtener un area por el ID
// ==========================================
const getAreaByID = (req, res) => {
    const id = req.params.id;
    consql.query(`SELECT IDarea as areaid, nombre_area, descripcion, 
    estado from area WHERE IDarea = ${ id } AND estado = 1 `, (err, filas) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando area',
                errors: err
            })
        }
        if (!err) {
            return res.status(200).json({
                ok: true,
                area: filas,
                aid: req.aid
            })
        }
    });
}

// ==========================================
// crear una nuevo area
// ==========================================
const crearArea = async(req, res) => {

    const p_nombre = req.body.nombre;
    const p_descripcion = req.body.descripcion;

    const query = `CALL USP_REG_AREA ( "${p_nombre}", "${p_descripcion}" )  `;

    //console.log(query);

    const reg = await registrar(req, res, query);
    //console.log(reg);
    //console.log(reg);

    if (reg == '') {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al crear area'
        })
    }
    const consulta = await consultar(req, res, reg);
    let arreglo = {
        uid: consulta[0].usuarioID,
        nombre: consulta[0].nombre_total
    }

    // crear token
    const token =  await generarJWT( consulta[0].usuarioID );

    const consulta_socket = await consultar_socket(req, res);

    // let arreglo_socket = {
    //     uid: consulta_socket[0].usuarioID,
    //     nombre: consulta_socket[0].nombre_total
    // }

    const server = Server.instance;
    server.io.emit('cambio-area', consulta_socket );
    
    res.status(201).json({
        ok: true,
        usuario: arreglo,
        areas: consulta_socket,
        //usuariotoken: req.usuario,
        token
    });
}

/*---------------------**/
function consultar_socket(req, res) {
    const query = `
    SELECT IDarea as areaid, nombre_area, descripcion, estado from area WHERE estado = 1  
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

function consultar(req, res, reg) {
    const query = `
    SELECT 
    IDarea, nombre_area, descripcion, estado from area
    where IDarea = ${reg} AND estado = 1  
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
// actualizar un area
// ==========================================
 const actualizarArea = async(req, res = response) => {
    const reg = req.params.id;

    const p_idp = req.body.idarea;
    const p_nombre = req.body.nombre;
    const p_descripcion = req.body.descripcion;

    const obtenerReg = await consultar(req, res, reg);
    if (obtenerReg == '') {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error area no encontrado'
        })
    }
    let arreglo = {
        idp: p_idp,
        nombre: p_nombre,
        descripcion: p_descripcion,

    }
    const actualizareg = await actualizar(req, res, arreglo);
    // insertId
    if (actualizareg.affectedRows == '0') {
        return res.status(400).json({
            ok: true,
            mensaje: 'Error al actualizar area'
        });
    }

    const consultar_nuevo = await consultar(req, res, reg);

    let arreglonuevo = {
        id: consultar_nuevo[0].IDarea,
        nombre: consultar_nuevo[0].nombre_area,
        descripcion: consultar_nuevo[0].descripcion
    }
    res.status(200).json({
        ok: true,
        usuario: arreglonuevo
    });

    

 };

 function actualizar(req, res, arreglo) {
    const p_idp = arreglo.idp;
    const p_nombre = arreglo.nombre;
    const p_descripcion = arreglo.descripcion;

    const query = `
    UPDATE area
    SET nombre_area = "${p_nombre}",
    descripcion = "${p_descripcion}" 
    WHERE IDarea = "${p_idp}"
    `;

    consql.query(query, (err, rows, fields) => {
        if (err) {
            console.log("Error: " + err.message);
            throw err;
        }
    });

    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            //console.log(query);
            resolve(rows);
        });
    });


    
}


// ==========================================
// borrar un area
// ==========================================
const borrarArea = async(req, res = response) => {
    const reg = req.params.id;

    const obtenerReg = await consultar(req, res, reg);
    if (obtenerReg == '') {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error area no encontrado'
        })
    }

    const actualizareg = await eliminar(req, res, reg);
    if (actualizareg.insertId != '0') {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar area'
        });
    }
    else{
        res.status(200).json({
            ok: true,
            mensaje: "Área eliminado"
        });
    }
}

function eliminar(req, res, reg) {
    const p_id = reg;

    const query = `
    UPDATE area
    SET estado = 0
    WHERE IDarea = "${p_id}"
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
    getAreas,
    crearArea,
    actualizarArea,
    borrarArea,
    getAreaByID
}