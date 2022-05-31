require("dotenv").config();
const hostname = process.env.HOST_NAME;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const database = process.env.DATABASE;

let mysql = require("mysql");

// function get_connection() {
//     var connection = mysql.createPool({
//         connectionLimit: 100,
//         host: hostname,
//         user: username,
//         password: password,
//         database: database,
//     });
//     connection.getConnection((err, connection) => {
//         if (err) throw err;
//         console.log("get_connection.js: connection.state = " + connection.state);
//         connection.release();
//     });
//     return connection;
// }

let connection = mysql.createPool({
    connectionLimit: 100,
    host: hostname,
    user: username,
    port: 3306,
    password: password,
    database: database,
});

console.log("get_connection.js: Connection Established");

module.exports = connection;
