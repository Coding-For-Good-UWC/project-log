require("dotenv").config();
const database = process.env.DATABASE;
const express = require("express");
const app = express();
const cors = require("cors");
const port = 4000;
const connection = require("./get_connection");

app.use(cors());

app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(express.json());

app.get("/", (req, res) => {
    // res.send("Hello World!");
    let query = `SELECT * FROM ${database}.projects`;
    console.log(query);
    connection.getConnection((err, conn) => {
        if (err) throw err;
        conn.query(query, function (error, results, fields) {
            console.log(results);
            res.json(results);
            if (error) throw error;
            conn.release();
        });
    });
});
app.use("/login", (req, res) => {
    let params = req.body;
    let query = `SELECT username, password_hash FROM ${database}.members WHERE username = ${connection.escape(
        params.username
    )};`;
    console.log(query);
    // Test account passwords are "test"

    connection.getConnection((err, conn) => {
        if (err) throw err;
        conn.query(query, function (error, results, fields) {
            console.log(results);
            if (results[0].password_hash == params.password) {
                res.send({ token: true });
            }
            if (error) throw error;
            conn.release();
        });
    });
});

app.listen(port, () => {
    console.log(`Hosting on http://localhost:${port}`);
});
