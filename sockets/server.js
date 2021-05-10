const express = require('express');
const morgan = require('morgan')



//const SERVER_PORT = '3000';

const socketIO = require('socket.io');
const http = require('http');
//const io = require('socket.io')(serverHttp);
//const serverHttp = require('http').Server(app);
const socket = require('./socket');

class Server {

    //static _instance: Server;
    //static _instance = Server;

    constructor () {
        // super( ...args );
        this.app = express();
        this.app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
        //this.host = '192.168.1.78';
        //console.log(this.host);
        this.port = 3000;
        

        //console.log(this.port);

        this.httpServer = new http.Server( this.app );
        
        this.io = socketIO( this.httpServer );
        
        this.escucharSockets();
    }

    static _instance = new this();

    static get instance() {
        return this._instance || ( this._instance = new Server() );
    }

    escucharSockets() {
        console.log('Escuchando conexiones - sockets');
        this.io.on('connection', cliente =>{
            //console.log('connection :', cliente.request.connection._peername);


            console.log('Cliente conectado');

            //console.log(cliente.id);

            // modo normal
            // cliente.on('disconnect', ()=>{
            //     console.log('Cliente desconectado');
            // });

            // mensajes
            socket.mensaje( cliente );

            // desconectar
            socket.desconectar( cliente );

        });
    }

    start( callback ){
        this.httpServer.listen( this.port, callback );
    }

}



 module.exports.Server = Server;
//     //mensaje,
//     //configurarUsuario
