const mysql = require('mysql');

// coneccion a la BD
const mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'app_inci',
    //insecureAuth : true,
    multipleStatements: true

    // host: '168.235.83.190',
    // user: 'app_docente',
    // password: '14789UGELadmin',
    // database: 'app_inci',
    // insecureAuth : true,
    // multipleStatements: true


    // host: 'us-cdbr-east-02.cleardb.com',
    // user: 'bee428e5551175',
    // password: '8b39bd38',
    // database: 'heroku_2e58d4390490c39',
    // insecureAuth : true,
    // multipleStatements: true
});

//mysql://:@/?reconnect=true

mysqlConnection.connect(function(err) {
    if (err) throw err;

    console.log('Estado de BD : \x1b[32m%s\x1b[0m', 'online');

});


// const dbConnection = async() => {
//     try{
//         await mysql.createConnection({
//             host: 'localhost',
//             user: 'root',
//             password: '',
//             database: 'app_inci',
//             multipleStatements: true
//         });
//         console.log('Estado de BD : \x1b[32m%s\x1b[0m', 'online');

//     } catch ( error ) {
//         console.log(error);
//         throw new Error('Error a la hora de iniciar la BD ver logs');        
//     }
// }

// module.exports = {
//     mysqlConnection
// }
module.exports = mysqlConnection;