require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json());

const port = process.env.PORT || 8080;
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
    let escaped = "";
    if (typeof input === "string" || input instanceof String) {
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
            res.json(results);
        }
    });
});

app.get("/members/:id", (req, res) => {
    const query = `SELECT * FROM ${database}.members WHERE id = ?`;
    pool.query(query, [sanatize(req.params.id)], (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "Member doesn't exist" });
        } else {
            res.json(results[0]);
        }
    });
});

app.get("/members/:id/skills", (req, res) => {
    // SELECT skill_name FROM u158898485_coding4good.skills INNER JOIN u158898485_coding4good.member_skills
    // ON u158898485_coding4good.skills.id=u158898485_coding4good.member_skills.skill_id WHERE u158898485_coding4good.member_skills.member_id = 1;
    const query = `SELECT skill_name FROM ${database}.skills INNER JOIN ${database}.member_skills ON ${database}.skills.id=${database}.member_skills.skill_id WHERE ${database}.member_skills.member_id = ?;`;
    pool.query(query, [sanatize(req.params.id)], (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No skills found" });
        } else {
            res.json(results);
        }
    });
});

// TODO
app.get("/members/:id/interests", (req, res) => {
    // SELECT interest_name FROM u158898485_coding4good.interests INNER JOIN u158898485_coding4good.member_interests
    // ON u158898485_coding4good.interests.id=u158898485_coding4good.member_interests.interest_id WHERE u158898485_coding4good.member_interests.member_id = 1;
    const query = `SELECT interest_name FROM ${database}.interests INNER JOIN ${database}.member_interests
    ON ${database}.interests.id=${database}.member_interests.interest_id WHERE ${database}.member_interests.member_id = ?;`;
    pool.query(query, [sanatize(req.params.id)], (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No skills found" });
        } else {
            res.json(results);
        }
    });
});

app.get("/members/:id/projects", (req, res) => {
    // SELECT project_name FROM u158898485_coding4good.projects INNER JOIN u158898485_coding4good.link_table
    // ON u158898485_coding4good.projects.id=u158898485_coding4good.link_table.project_id WHERE u158898485_coding4good.link_table.member_id = 1;
    const query = `SELECT projects.id, project_name FROM ${database}.projects INNER JOIN ${database}.link_table ON ${database}.projects.id = ${database}.link_table.project_id WHERE ${database}.link_table.member_id = ?`;
    pool.query(query, [sanatize(req.params.id)], (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No projects found" });
        } else {
            res.json(results);
        }
    });
});

app.post("/members/:id/new-projects", (req, res) => {
    let params = req.body;
    // {
    //     project_ids: ["","",""],
    // };

    let flag = true;
    let error_code = "";
    for (let i = 0; i < params.project_ids.length; i++) {
        const query = `INSERT INTO ${database}.link_table (member_id, project_id) VALUES (?,?)`;
        pool.query(
            query,
            [sanatize(req.params.id), sanatize(params.project_ids[i])],
            (error) => {
                if (error) {
                    flag = false;
                    error_code = error.code;
                }
            }
        );
    }
    if ((flag = false)) {
        res.json({
            error_message: `${error_code}: Inserting record failed!`,
        });
    } else {
        res.json({ data: params });
    }
});

app.post("/members/:id/remove-projects", (req, res) => {
    let params = req.body;
    // ["","",""]

    let flag = true;
    let error_code = "";
    for (let i = 0; i < params.length; i++) {
        const query = `DELETE FROM ${database}.link_table WHERE member_id = ? AND project_id = ?`;
        pool.query(
            query,
            [sanatize(req.params.id), sanatize(params[i])],
            (error) => {
                if (error) {
                    flag = false;
                    error_code = error.code;
                }
            }
        );
    }
    if ((flag = false)) {
        res.json({
            error_message: `${error_code}: Inserting record failed!`,
        });
    } else {
        res.json({ data: params });
    }
});

app.get("/projects/:id", (req, res) => {
    const query = `SELECT * FROM ${database}.projects WHERE id = ?`;
    pool.query(query, [sanatize(req.params.id)], (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No projects found" });
        } else {
            res.json(results[0]);
        }
    });
});

app.get("/projects/:id/members", (req, res) => {
    // SELECT first_name, last_name FROM u158898485_coding4good.members INNER JOIN u158898485_coding4good.link_table
    // ON u158898485_coding4good.members.id=u158898485_coding4good.link_table.member_id WHERE project_id = 3;
    const query = `SELECT link_table.member_id, first_name, last_name FROM ${database}.members INNER JOIN ${database}.link_table ON ${database}.members.id=${database}.link_table.member_id WHERE project_id = ?`;
    pool.query(query, [sanatize(req.params.id)], (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No users found" });
        } else {
            res.json(results);
        }
    });
});

app.get("/projects/:id/skills", (req, res) => {
    // SELECT skill_name FROM u158898485_coding4good.skills INNER JOIN u158898485_coding4good.project_skills
    // ON u158898485_coding4good.skills.id=u158898485_coding4good.project_skills.skill_id WHERE u158898485_coding4good.project_skills.project_id = 1;
    const query = `SELECT skill_name FROM ${database}.skills INNER JOIN ${database}.project_skills ON ${database}.skills.id=${database}.project_skills.skill_id WHERE ${database}.project_skills.project_id = ?;`;
    pool.query(query, [sanatize(req.params.id)], (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No skills found" });
        } else {
            res.json(results);
        }
    });
});

app.get("/projects/:id/interests", (req, res) => {
    // SELECT interest_name FROM u158898485_coding4good.interests INNER JOIN u158898485_coding4good.project_interests
    // ON u158898485_coding4good.interests.id=u158898485_coding4good.project_interests.interest_id WHERE u158898485_coding4good.project_interests.project_id = 1;
    const query = `SELECT interest_name FROM ${database}.interests INNER JOIN ${database}.project_interests ON ${database}.interests.id=${database}.project_interests.interest_id WHERE ${database}.project_interests.project_id = ?;`;
    pool.query(query, [sanatize(req.params.id)], (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No interests found" });
        } else {
            res.json(results);
        }
    });
});

app.get("/projects/:id/updates", (req, res) => {
    const query = `SELECT * FROM ${database}.update_log WHERE project_id = ?`;
    pool.query(query, [sanatize(req.params.id)], (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No updates found" });
        } else {
            res.json(results);
        }
    });
});

app.post("/projects/:id/new", (req, res) => {
    let params = req.body;
    // {
    //     member_id: #,
    //     date: YYYY-MM-DD,
    //     post_description: ["","",""],
    // };

    let flag = true;
    let error_code = "";
    for (let i = 0; i < params.post_description.length; i++) {
        const query = `INSERT INTO ${database}.update_log (project_id, member_id, date, post_description) VALUES (?,?,?,?)`;
        pool.query(
            query,
            [
                sanatize(req.params.id),
                sanatize(params.member_id),
                sanatize(params.date),
                sanatize(params.post_description[i]),
            ],
            (error) => {
                if (error) {
                    flag = false;
                    error_code = error.code;
                }
            }
        );
    }
    if ((flag = false)) {
        res.json({
            error_message: `${error_code}: Inserting record failed!`,
        });
    } else {
        res.json({ data: params });
    }
});

app.post("/projects/:id/edit", (req, res) => {
    const data = {
        project_name: sanatize(req.body.project_name),
        description: sanatize(req.body.description),
        client: sanatize(req.body.client),
        status: sanatize(req.body.status),
    };
    const query = `UPDATE ${database}.projects SET project_name = ?, description = ?, client = ?, status = ? WHERE id = ?`;
    pool.query(
        query,
        [
            data.project_name,
            data.description,
            data.client,
            data.status,
            req.params.id,
        ],
        (error) => {
            if (error) {
                res.json({
                    error_message: `${error.code}: Updating record failed!`,
                });
            } else {
                res.json({ data: data });
            }
        }
    );
});

app.use("/login", (req, res) => {
    // Test account passwords are "test"
    let params = req.body;
    const query = `SELECT id, password_hash FROM ${database}.members WHERE username = ?`;
    pool.query(query, [sanatize(params.username)], (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No user with that username found" });
        } else {
            if (results[0].password_hash == sanatize(params.password)) {
                let user_id = results[0].id;
                res.send({ token: true, id: user_id });
            } else {
                res.json({ error_message: "Password is invalid" });
            }
        }
    });
});

app.listen(port, () => {
    console.log(`Hosting on http://localhost:${port}`);
});
