
//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { response } = require('express');
const bcrypt = require('bcrypt');

const { generarJWT } = require('../helpers/jwt');

// ==========================================
// login de usuario
// ==========================================
const login = async(req, res = response) => {
    const body = req.body;

    const obtenerReg = await consultar_usuario(req, res, body);
    if (obtenerReg == '') {
        return res.status(400).json({
            ok: false,
            mensaje: 'Usuario incorrecto'
        })
    }

    if (!bcrypt.compareSync(body.password, obtenerReg[0].password)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Credenciales incorrectas - password'
        })
    }
    let arreglo = {
        id: obtenerReg[0].usuarioID,
        nombre: obtenerReg[0].nombre,
        usuario: obtenerReg[0].usuario,
        role: obtenerReg[0].role
    }

    // crear token
    const token =  await generarJWT( obtenerReg[0].usuarioID );
    //var token = jwt.sign({ usuario: arreglo }, SEED, { expiresIn: 14400 }); // expira en 4h


    res.status(200).json({
        ok: true,
        usuario: arreglo,
        id: obtenerReg[0].usuarioID,
        token: token,
        role: obtenerReg[0].nombre,
        nombre_completo: obtenerReg[0].nombrecompleto,
        message : 'Login correcto'
    });
}


function consultar_usuario(req, res, body) {
    const p_usuario = body.usuario;
    const query = `
    SELECT 
    *
    from usuario
    inner join persona
    on persona.IDpersona = usuario.IDpersona
    inner join rol
    on rol.IDrol = usuario.IDrol
    where usuario.usuario = "${p_usuario}"
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

const renewToken = async(req, res = response) =>{

    const uid = req.uid;
    
    // crear token
    const token =  await generarJWT( uid );

    res.json({
        ok: true,
        token
    });
}


module.exports = {
    login,
    renewToken
}