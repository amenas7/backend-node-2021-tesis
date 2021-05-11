const bcrypt = require('bcrypt');
const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const { Server } = require('./../sockets/server');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


const vapidKeys = {
    "publicKey": "BGhCb_D5Ljg7rW-kSz3YGbH6liVgAvWI6s5duToxLqZPRdW_5oAczaOxyqhUA5g2MdiQNlJ405LiffLWKtdU-Oo",
    "privateKey": "fmr4Z7X_aseorihg7YERjZ31sjAf3AklRIqcuivsB1w"
}
  
webpush.setVapidDetails(
    'mailto:amenas94@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

// ------------ HELPERS ------------------------------//

const handlerResponse = (res, data, code = 200) => {
    res.status(code).send({data})
}

//------------- CONTROLADORES -------------------------//

  const sendPush = (req, res) => {

    const payload = {
      "notification": {
        "title": "HOLA CLARO QUE SIIIIII !! MUY BIEN",
        "body": "Subscribete a mi canal de YOUTUBE",
        "vibrate": [100, 50, 100],
        "image": "https://avatars2.githubusercontent.com/u/15802366?s=460&u=ac6cc646599f2ed6c4699a74b15192a29177f85a&v=4",
        "actions": [{
          "action": "explore",
          "title": "HOLA!"
        }]
      }
    }
  
    const directoryPath = path.join(__dirname, '../tokens');

    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        handlerResponse(res, `Error read`, 500);
      }
  
      files.forEach((file) => {
        const tokenRaw = fs.readFileSync(`${directoryPath}/${file}`);
        const tokenParse = JSON.parse(tokenRaw);
  
        webpush.sendNotification(
          tokenParse,
          JSON.stringify(payload))
          .then(res => {
            console.log('Enviado !!');
          }).catch(err => {
          console.log('** USUARIO NO TIENE PERMISOS O LAS KEYS NO SON CORRECTAS');
        })
  
      });
    });
  
    res.send({data: 'Se envio subscribete!!'})
  
  }

module.exports = {
    sendPush
}