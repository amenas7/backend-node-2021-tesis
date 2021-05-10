//import { Socket } from 'socket.io';


function desconectar ( cliente ) {
    cliente.on('disconnect', () =>{
        console.log('Cliente desconectado');
    });
}

// escuchar mensajes
function mensaje ( cliente ){
    cliente.on('mensaje', ( payload ) =>{
        console.log('Mensaje recibido', payload);

        //io.emit('mensaje-nuevo', payload);

    });
}

// configurar usuario del login
// function configurarUsuario ( cliente, io ){
//     cliente.on('configurar-usuario', ( payload = { nombre } , callback ) =>{
//         console.log('Configurando usuario', payload.nombre);
//         callback({
//             ok: true,
//             mensaje: `Usuario ${ payload.nombre }, configurado`
//         });
//         //io.emit('mensaje-nuevo', payload);

//     });
// }


module.exports = {
    desconectar,
    mensaje,
    //configurarUsuario
}