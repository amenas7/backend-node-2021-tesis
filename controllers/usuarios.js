const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener todos los usuarios
// ==========================================
const getUsuarios = (req, res) => {
    consql.query(` SELECT 
    usuario.usuarioID as uid, persona.numdoc, concat( persona.apepat, ' ', persona.apemat, ', ', persona.nombres ) as nombre_total,
    usuario.usuario, usuario.IDarea, area.nombre_area, usuario.IDrol, rol.nombre as nombre_rol ,usuario.estado
    from usuario
    inner join persona
    on persona.IDpersona = usuario.IDpersona
    inner join area
    on usuario.IDarea = area.IDarea
    inner join rol
    on usuario.IDrol = rol.IDrol
    WHERE usuario.estado = 1 ORDER BY usuario.usuarioID DESC`, (err, filas) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuarios',
                errors: err
            })
        }
        if (!err) {
            return res.status(200).json({
                ok: true,
                usuarios: filas,
                uid: req.uid
            })
        }
    });
}

// ==========================================
// obtener un usuario por el ID
// ==========================================
const getUsuarioByID = (req, res) => {
    const id = req.params.id;
    consql.query(`SELECT persona.IDpersona, 
    usuario.usuarioID as uid, persona.numdoc ,concat( persona.apepat, ' ', persona.apemat, ', ', persona.nombres ) as nombre_total,
    usuario.usuario, persona.apepat as apaterno, persona.apemat as amaterno, persona.nombres as solo_nombre, 
		usuario.IDarea, area.nombre_area, usuario.IDrol, rol.descripcion as nombre_rol ,usuario.estado,
		persona.email as correo, persona.IDsede
    from usuario
    inner join persona
    on persona.IDpersona = usuario.IDpersona
    inner join area
    on usuario.IDarea = area.IDarea
    inner join rol
    on usuario.IDrol = rol.IDrol
    where usuario.usuarioID = ${ id } AND usuario.estado = 1 `, (err, filas) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuario',
                errors: err
            })
        }
        if (!err) {
            return res.status(200).json({
                ok: true,
                usuario: filas,
                uid: req.uid
            })
        }
    });
}

// ==========================================
// crear un nuevo usuario
// ==========================================
const crearUsuario = async(req, res) => {

    const p_dni = req.body.dni;
    const p_nombres = req.body.nombres;
    const p_apaterno = req.body.apaterno;
    const p_amaterno = req.body.amaterno;
    const p_usuario = req.body.usuario;
    const p_role = req.body.role;
    const p_area = req.body.area;
    const p_sede = req.body.sede;
    const p_correo = req.body.correo;

    // escriptar password
    const salt = bcrypt.genSaltSync();
    const p_password = bcrypt.hashSync( req.body.password, salt );

    const query = `CALL USP_REG_USUARIO( "${p_dni}", "${p_apaterno}", "${p_amaterno}", 
    "${p_nombres}", "${p_usuario}", "${p_password}" , "${p_role}", "${p_area}", "${p_sede}", "${p_correo}" )  `;

    //console.log(query);

    const reg = await registrar(req, res, query);
    //console.log(reg);
    //console.log(reg);

    if (reg == '') {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al crear usuario'
        })
    }
    const consulta = await consultar(req, res, reg);
    let arreglo = {
        uid: consulta[0].usuarioID,
        nombre: consulta[0].nombre_total,
        usuario: consulta[0].usuario,
        password: consulta[0].password,
        role: consulta[0].nombre_rol
    }

    // crear token
    const token =  await generarJWT( consulta[0].usuarioID );
    
    res.status(201).json({
        ok: true,
        usuario: arreglo,
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

function consultar(req, res, reg) {
    const query = `
    SELECT 
    usuario.usuarioID, persona.numdoc ,concat( persona.apepat, ' ', persona.apemat, ', ', persona.nombres ) as nombre_total, 
    persona.apepat as apaterno, persona.apemat as amaterno, persona.nombres as solo_nombre, 
    usuario.usuario, usuario.IDarea, area.nombre_area, usuario.IDrol, rol.descripcion as nombre_rol ,usuario.estado
    from usuario
    inner join persona
    on persona.IDpersona = usuario.IDpersona
    inner join area
    on usuario.IDarea = area.IDarea
    inner join rol
    on usuario.IDrol = rol.IDrol
    where usuario.usuarioID = ${reg} AND usuario.estado = 1  
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
// actualizar un usuario
// ==========================================
 const actualizarUsuario = async(req, res = response) => {
    const reg = req.params.id;

    // const p_nombre = req.body.nombre;
    // const p_usuario = req.body.usuario;
    // const p_role = req.body.role;

    const p_idp = req.body.id_persona;
    const p_dni = req.body.dni;
    const p_nombres = req.body.nombres;
    const p_apaterno = req.body.apaterno;
    const p_amaterno = req.body.amaterno;
    const p_usuario = req.body.usuario;
    const p_role = req.body.role;
    const p_area = req.body.area;
    const p_correo = req.body.correo;
    const p_sede = req.body.sede;

    const obtenerReg = await consultar(req, res, reg);
    if (obtenerReg == '') {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error usuario no encontrado'
        })
    }
    let arreglo = {
        idu: reg,
        idp: p_idp,
        dni: p_dni,
        nombres: p_nombres,
        apaterno: p_apaterno,
        amaterno: p_amaterno,
        usuario: p_usuario,
        role: p_role,
        area: p_area,
        correo: p_correo,
        sede: p_sede
    }
    const actualizareg = await actualizar(req, res, arreglo);
    // insertId
    if (actualizareg.affectedRows == '0') {
        return res.status(400).json({
            ok: true,
            mensaje: 'Error al actualizar usuario'
        });
    }

    const consultar_nuevo = await consultar(req, res, reg);

    let arreglonuevo = {
        id: consultar_nuevo[0].usuarioID,
        nombre: consultar_nuevo[0].nombre_total,
        usuario: consultar_nuevo[0].usuario,
        role: consultar_nuevo[0].role,
        area: consultar_nuevo[0].area
    }
    res.status(200).json({
        ok: true,
        usuario: arreglonuevo
    });

    

 };

 function actualizar(req, res, arreglo) {
    const p_id = arreglo.idu;
    const p_idp = arreglo.idp;
    const p_dni = arreglo.dni;
    const p_nombres = arreglo.nombres;
    const p_apaterno = arreglo.apaterno;
    const p_amaterno = arreglo.amaterno;
    const p_usuario = arreglo.usuario;
    const p_role = arreglo.role;
    const p_area = arreglo.area;
    const p_correo = arreglo.correo;
    const p_sede = arreglo.sede;

    const query = `
    UPDATE persona
    SET numdoc = "${p_dni}",
    nombres = "${p_nombres}",
    apepat = "${p_apaterno}",
    apemat = "${p_amaterno}",
    email = "${p_correo}",
    IDsede = "${p_sede}"
    WHERE IDpersona = "${p_idp}"
    `;

    //console.log(query);

    const query2 = `
    UPDATE usuario
    SET usuario = "${p_usuario}",
    IDrol = "${p_role}",
    IDarea = "${p_area}" 
    WHERE usuarioID = "${p_id}"
    `;

    consql.query(query2, (err, rows, fields) => {
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
// borrar un usuario
// ==========================================
const borrarUsuario = async(req, res = response) => {
    const reg = req.params.id;

    const obtenerReg = await consultar(req, res, reg);
    if (obtenerReg == '') {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error usuario no encontrado'
        })
    }

    const actualizareg = await eliminar(req, res, reg);
    if (actualizareg.insertId != '0') {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar usuario'
        });
    }
    else{
        res.status(200).json({
            ok: true,
            mensaje: "Usuario eliminado"
        });
    }
}

function eliminar(req, res, reg) {
    const p_id = reg;

    const query = `
    UPDATE usuario
    SET estado = 0
    WHERE usuarioID = "${p_id}"
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
/*---------------------------------------------------*/
/*--------------------ROLES--------------------------*/
// ==========================================
// obtener todos los roles activos
// ==========================================
const getUsuarios_roles = (req, res) => {
    consql.query( `SELECT IDrol, descripcion, estado FROM rol where estado = 1`, (err, filas) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando roles',
                errors: err
            })
        }
        if (!err) {
            return res.status(200).json({
                ok: true,
                usuarios: filas,
                uid: req.uid
            })
        }
    });
}


module.exports = {
    getUsuarios,
    crearUsuario,
    actualizarUsuario,
    borrarUsuario,
    getUsuarioByID
}