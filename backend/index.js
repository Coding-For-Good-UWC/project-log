// require("dotenv").config();
// const database = process.env.DATABASE;
// const express = require("express");
// const app = express();
// const cors = require("cors");
// const port = 4000;
// const connection = require("./get_connection");

// app.use(cors());

// app.use(
//     express.urlencoded({
//         extended: true,
//     })
// );

// app.use(express.json());

require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const app = express();
app.use(express.json());

const port = process.env.PORT || 8080;
const version = process.env.VERSION || 1;
const hostname = process.env.HOST_NAME;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const database = process.env.DATABASE;

let pool = mysql.createPool({
    connectionLimit: 100,
    host: hostname,
    user: username,
    port: 3306,
    password: password,
    database: database,
});

function sanatize(input) {
    let escaped = ""
    if (typeof input === 'string' || input instanceof String){
        escaped = pool.escape(input);
    } else {
        escaped = pool.escape(input.toString());
    }
    return escaped.slice(1, -1);
}

app.get("/", (req, res) => {
    const query = `SELECT * FROM ${database}.projects`;
    pool.query(query, (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No projects found" });
        } else {
            res.json(results[0]);
        }
    });
});
app.use("/login", (req, res) => {
    // Test account passwords are "test"
    let params = req.body;
    const query = `SELECT password_hash FROM ${database}.users WHERE username = ?`;
    pool.query(query, [sanatize(params.username)], (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No user with that username found" });
        } else {
            if (results[0].password_hash == sanatize(params.password)) {
                res.send({ token: true }); //TODO: ASK ADI
            } else {
                res.json({ error_message: "Password is invalid" });
            }
        }
    });
});

app.listen(port, () => {
    console.log(`Hosting on http://localhost:${port}`);
});
