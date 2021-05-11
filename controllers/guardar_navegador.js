const bcrypt = require('bcrypt');
const webpush = require('web-push');
const fs = require('fs');

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

const savePush = (req, res) => {

    const name = Math.floor(Date.now() / 1000);
  
    let tokenBrowser = req.body.token;
  
    let data = JSON.stringify(tokenBrowser, null, 2);
  
    fs.writeFile(`./tokens/token-${name}.json`, data, (err) => {
      if (err) throw err;
      handlerResponse(res, `Save success`)
    });
};





module.exports = {
    savePush
}