require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const app = express();
const cors = require("cors");
const { query } = require("express");
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

// function multiInsertQuery(
//     prelim_query,
//     static_variables,
//     loop_variable,
//     need_brackets = true
// ) {
//     let full_query = prelim_query;
//     let first_values = "";
//     // format static_variables
//     for (let i = 0; i < static_variables.length; i++) {
//         let x = "";
//         if (i != static_variables.length - 1) {
//             x = `${sanatize(static_variables[i])},`;
//         } else {
//             x = `${sanatize(static_variables[i])}`;
//         }
//         first_values += x;
//     }
//     if (need_brackets) {
//         full_query += "(";
//     }
//     for (let i = 0; i < loop_variable.length; i++) {
//         let query = "";
//         if (i != loop_variable.length - 1) {
//             query = `(${first_values},${sanatize(loop_variable[i])}),`;
//         } else {
//             query = `(${first_values},${sanatize(loop_variable[i])})`;
//         }
//         full_query += query;
//     }
//     if (need_brackets) {
//         full_query += ")";
//     }

//     full_query += ";";

//     return full_query;
// }
// function secondaryMultiInsertQuery(
//     prelim_query,
//     static_variables,
//     loop_variable
// ) {
//     console.log(loop_variable);
//     let full_query = prelim_query;
//     let first_values = "";
//     // format static_variables
//     for (let i = 0; i < static_variables.length; i++) {
//         let x = "";
//         if (i != static_variables.length - 1) {
//             x = `'${sanatize(static_variables[i])}',`;
//         } else {
//             x = `'${sanatize(static_variables[i])}'`;
//         }
//         first_values += x;
//     }
//     console.log(first_values);
//     for (let i = 0; i < loop_variable.length; i++) {
//         let query = "";
//         if (i != loop_variable.length - 1) {
//             query = `(${first_values},"${sanatize(loop_variable[i])}"),`;
//         } else {
//             query = `(${first_values},"${sanatize(loop_variable[i])}")`;
//         }
//         full_query += query;
//     }
//     full_query += ";";

//     return full_query;
// }

// columns: array of column names
// values: array of values that line up with columns
function singleInsertQuery(table_name, columns, values) {
    // INSERT INTO table_name (column1, column2, column3, ...) VALUES (value1, value2, value3, ...);
    a = "(";
    for (let i = 0; i < columns.length; i++) {
        a += columns[i];
        if (i + 1 != columns.length) {
            a += ", ";
        }
    }
    a += ")";
    b = "(";
    for (let i = 0; i < values.length; i++) {
        b += values[i];
        if (i + 1 != values.length) {
            b += ", ";
        }
    }
    b += ")";

    query = "INSERT INTO " + table_name + " " + a + " VALUES " + b + ";";

    return query;
}
// columns: array of column names
// values: 2d array of values that line up with columns
function multiInsertQuery(table_name, columns, values) {
    // INSERT INTO table_name (column1, column2, column3, ...) VALUES (value1, value2, value3, ...),(value1, value2, value3, ...),(value1, value2, value3, ...);
    a = "(";
    for (let i = 0; i < columns.length; i++) {
        a += columns[i];
        if (i + 1 != columns.length) {
            a += ", ";
        }
    }
    a += ")";
    b = "";
    for (let x = 0; x < values.length; x++) {
        b += "(";
        for (let i = 0; i < values[x].length; i++) {
            b += values[x][i];
            if (i + 1 != values[x].length) {
                b += ", ";
            }
        }
        if (x + 1 != values.length) {
            b += "), ";
        } else {
            b += ")";
        }
    }

    query = "INSERT INTO " + table_name + " " + a + " VALUES " + b + ";";

    return query;
}

// columns: array of column names
// values: array of values that line up with columns
function singleDeleteQuery(table_name, columns, values) {
    // DELETE FROM table_name WHERE column 1 = value1 AND column 2 = value 2;
    a = "";
    for (let i = 0; i < columns.length; i++) {
        v = columns[i].toString() + " = " + values[i].toString();
        a += v;
        if (i + 1 != columns.length) {
            a += " AND ";
        }
    }
    query = "DELETE FROM " + table_name + " WHERE " + a + ";";
    return query;
}

function multiDeleteQuery(table_name, columns, values) {
    // DELETE FROM table_name WHERE (column 1, column 2) IN ((value1, value2), (value1, value2))
    a = "(";
    for (let i = 0; i < columns.length; i++) {
        a += columns[i];
        if (i + 1 != columns.length) {
            a += ", ";
        }
    }
    a += ")";
    b = "(";
    for (let x = 0; x < values.length; x++) {
        b += "(";
        for (let i = 0; i < values[x].length; i++) {
            b += values[x][i];
            if (i + 1 != values[x].length) {
                b += ", ";
            }
        }
        if (x + 1 != values.length) {
            b += "), ";
        } else {
            b += ")";
        }
    }
    b += ")";

    query = "DELETE FROM " + table_name + " WHERE " + a + " IN " + b + ";";

    return query;
}

app.get("/", (req, res) => {
    console.log("/");
    const query = `SELECT * FROM ${database}.projects`;
    console.log(query);
    pool.query(query, (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No projects found" });
        } else {
            res.json(results);
        }
    });
});

app.get("/skills", (req, res) => {
    console.log("/skills");
    const query = `SELECT * FROM ${database}.skills`;
    console.log(query);
    pool.query(query, (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No skills found" });
        } else {
            res.json(results);
        }
    });
});

app.get("/all-project-skills", (req, res) => {
    console.log("/all-project-skills");
    // SELECT projects.id, project_skills.skill_id, projects.project_name FROM u158898485_coding4good.project_skills
    // INNER JOIN u158898485_coding4good.projects ON u158898485_coding4good.projects.id=u158898485_coding4good.project_skills.project_id
    const query = `SELECT projects.id, project_skills.skill_id, projects.project_name FROM ${database}.project_skills 
    INNER JOIN ${database}.projects ON ${database}.projects.id=${database}.project_skills.project_id`;
    console.log(query);
    pool.query(query, (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No skills found" });
        } else {
            let output = [];
            for (let i = 0; i < results.length; i++) {
                let existing_id = false;
                for (let j = 0; j < output.length; j++) {
                    if (results[i].id == output[j].id) {
                        existing_id = true;
                        output[j].skill_id.push(results[i].skill_id);
                    }
                }

                if (existing_id == false) {
                    output.push({
                        id: results[i].id,
                        project_name: results[i].project_name,
                        skill_id: [results[i].skill_id],
                    });
                }
            }
            res.json(output);
        }
    });
});

app.get("/all-project-interests", (req, res) => {
    console.log("/all-project-interests");
    // SELECT projects.id, project_interests.interest_id, projects.project_name FROM u158898485_coding4good.project_interests
    // INNER JOIN u158898485_coding4good.projects ON u158898485_coding4good.projects.id=u158898485_coding4good.project_interests.project_id
    const query = `SELECT projects.id, project_interests.interest_id, projects.project_name FROM ${database}.project_interests
    INNER JOIN ${database}.projects ON ${database}.projects.id=${database}.project_interests.project_id`;
    console.log(query);
    pool.query(query, (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No skills found" });
        } else {
            let output = [];
            for (let i = 0; i < results.length; i++) {
                let existing_id = false;
                for (let j = 0; j < output.length; j++) {
                    if (results[i].id == output[j].id) {
                        existing_id = true;
                        output[j].interest_id.push(results[i].interest_id);
                    }
                }

                if (existing_id == false) {
                    output.push({
                        id: results[i].id,
                        project_name: results[i].project_name,
                        interest_id: [results[i].interest_id],
                    });
                }
            }
            res.json(output);
        }
    });
});

app.get("/interests", (req, res) => {
    console.log("/interests");
    const query = `SELECT * FROM ${database}.interests`;
    console.log(query);
    pool.query(query, (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No interests found" });
        } else {
            res.json(results);
        }
    });
});

app.get("/members/:id", (req, res) => {
    console.log("/members/:id");
    const query = `SELECT * FROM ${database}.members WHERE id = ?`;
    console.log(query);
    pool.query(query, [sanatize(req.params.id)], (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "Member doesn't exist" });
        } else {
            res.json(results[0]);
        }
    });
});

app.get("/members/:id/skills", (req, res) => {
    console.log("/members/:id/skills");
    // SELECT skills.id, skill_name FROM u158898485_coding4good.skills INNER JOIN u158898485_coding4good.member_skills
    // ON u158898485_coding4good.skills.id=u158898485_coding4good.member_skills.skill_id WHERE u158898485_coding4good.member_skills.member_id = 1;
    const query = `SELECT skills.id, skill_name FROM ${database}.skills INNER JOIN ${database}.member_skills ON ${database}.skills.id=${database}.member_skills.skill_id WHERE ${database}.member_skills.member_id = ?;`;
    console.log(query);
    pool.query(query, [sanatize(req.params.id)], (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No skills found" });
        } else {
            res.json(results);
        }
    });
});

app.get("/members/:id/interests", (req, res) => {
    console.log("/members/:id/interests");
    // SELECT interests.id, interest_name FROM u158898485_coding4good.interests INNER JOIN u158898485_coding4good.member_interests
    // ON u158898485_coding4good.interests.id=u158898485_coding4good.member_interests.interest_id WHERE u158898485_coding4good.member_interests.member_id = 1;
    const query = `SELECT interests.id, interest_name FROM ${database}.interests INNER JOIN ${database}.member_interests
    ON ${database}.interests.id=${database}.member_interests.interest_id WHERE ${database}.member_interests.member_id = ?;`;
    console.log(query);
    pool.query(query, [sanatize(req.params.id)], (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No skills found" });
        } else {
            res.json(results);
        }
    });
});

app.post("/members/:id/new-skills", (req, res) => {
    console.log("/members/:id/new-skills");
    let table_name = `${database}.member_skills`;
    let columns = ["member_id", "skill_id"];
    let value = [];

    let params = req.body;
    // let error_code = "";
    // let flag = true;
    // let loop_variable = [];
    // let need_brackets = false;
    // let full_query = `INSERT INTO ${database}.member_skills (member_id, skill_id) VALUES `;
    params.map((obj, key) => {
        loop_variable[key] = obj.skill_id;
    });
    // let final_query = multiInsertQuery(
    //     full_query,
    //     [req.params.id],
    //     loop_variable,
    //     need_brackets
    // );
    let final_query = "";
    if (loop_variable.length == 1) {
        value = loop_variable[0];
        final_query = singleInsertQuery(table_name, columns, value);
    } else {
        final_query = multiInsertQuery(table_name, columns, loop_variable);
    }
    console.log(final_query);
    pool.query(final_query, (error) => {
        if (error) {
            flag = false;
            error_code = error.code;
        }
    });
    if ((flag = false)) {
        console.log("\x1b[31m", "error");
        res.json({
            error_message: `${error_code}: Inserting record failed!`,
        });
    } else {
        res.json({ data: params });
    }
});

app.post("/members/:id/delete-skills", (req, res) => {
    console.log("/members/:id/delete-skills");
    let params = req.body;
    let flag = true;
    let error_code = "";
    let loop_variable = [];
    let full_query = `DELETE FROM ${database}.member_skills WHERE (member_id, skill_id) IN `;
    params.map((obj, key) => {
        loop_variable[key] = obj.skill_id;
    });
    let final_query = multiInsertQuery(
        full_query,
        [req.params.id],
        loop_variable
    );
    console.log(final_query);
    pool.query(final_query, (error) => {
        if (error) {
            flag = false;
            error_code = error.code;
        }
    });
    if ((flag = false)) {
        console.log("\x1b[31m", "error");
        res.json({
            error_message: `${error_code}: Inserting record failed!`,
        });
    } else {
        res.json({ data: params });
    }
});

app.post("/members/:id/new-interests", (req, res) => {
    console.log("/members/:id/new-interests");
    let params = req.body;
    let flag = true;
    let error_code = "";
    let loop_variable = [];

    let need_brackets = false;
    let full_query = `INSERT INTO ${database}.member_interests (member_id, interest_id) VALUES `;
    params.map((obj, key) => {
        loop_variable[key] = obj.interest_id;
    });
    let final_query = multiInsertQuery(
        full_query,
        [req.params.id],
        loop_variable,
        need_brackets
    );
    console.log(final_query);
    pool.query(final_query, (error) => {
        if (error) {
            flag = false;
            error_code = error.code;
        }
    });
    if ((flag = false)) {
        console.log("\x1b[31m", "error");
        res.json({
            error_message: `${error_code}: Inserting record failed!`,
        });
    } else {
        res.json({ data: params });
    }
});

app.post("/members/:id/delete-interests", (req, res) => {
    console.log("/members/:id/delete-interests");
    let params = req.body;
    let flag = true;
    let error_code = "";
    let loop_variable = [];
    let full_query = `DELETE FROM ${database}.member_interests WHERE (member_id, interest_id) IN `;
    params.map((obj, key) => {
        loop_variable[key] = obj.interest_id;
    });
    let final_query = multiInsertQuery(
        full_query,
        [req.params.id],
        loop_variable
    );
    console.log(final_query);
    pool.query(final_query, (error) => {
        if (error) {
            flag = false;
            error_code = error.code;
        }
    });
    if ((flag = false)) {
        console.log("\x1b[31m", "error");
        res.json({
            error_message: `${error_code}: Inserting record failed!`,
        });
    } else {
        res.json({ data: params });
    }
});

app.get("/members/:id/projects", (req, res) => {
    console.log("/members/:id/projects");
    // SELECT project_name FROM u158898485_coding4good.projects INNER JOIN u158898485_coding4good.link_table
    // ON u158898485_coding4good.projects.id=u158898485_coding4good.link_table.project_id WHERE u158898485_coding4good.link_table.member_id = 1;
    const query = `SELECT projects.id, project_name FROM ${database}.projects INNER JOIN ${database}.link_table ON ${database}.projects.id = ${database}.link_table.project_id WHERE ${database}.link_table.member_id = ?`;
    console.log(query);
    pool.query(query, [sanatize(req.params.id)], (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No projects found" });
        } else {
            res.json(results);
        }
    });
});

app.post("/members/:id/new-projects", (req, res) => {
    console.log("/members/:id/new-projects");
    let params = req.body;
    // {
    //     project_ids: ["","",""],
    // };

    let flag = true;
    let error_code = "";

    let need_brackets = false;
    let full_query = `INSERT INTO ${database}.link_table (member_id, project_id) VALUES `;
    let loop_variable = params.project_ids;
    let final_query = multiInsertQuery(
        full_query,
        [req.params.id],
        loop_variable,
        need_brackets
    );
    console.log(final_query);
    pool.query(final_query, (error) => {
        if (error) {
            flag = false;
            error_code = error.code;
        }
    });
    if ((flag = false)) {
        console.log("\x1b[31m", "error");
        res.json({
            error_message: `${error_code}: Inserting record failed!`,
        });
    } else {
        res.json({ data: params });
    }
});

app.post("/members/:id/remove-projects", (req, res) => {
    console.log("/members/:id/remove-projects");
    let params = req.body;
    // ["","",""]

    let flag = true;
    let error_code = "";

    let loop_variable = params;
    let full_query = `DELETE FROM ${database}.link_table WHERE (member_id, project_id) IN `;
    let final_query = multiInsertQuery(
        full_query,
        [req.params.id],
        loop_variable
    );
    console.log(final_query);
    pool.query(final_query, (error) => {
        if (error) {
            flag = false;
            error_code = error.code;
        }
    });
    if ((flag = false)) {
        console.log("\x1b[31m", "error");
        res.json({
            error_message: `${error_code}: Inserting record failed!`,
        });
    } else {
        res.json({ data: params });
    }
});

app.get("/projects/:id", (req, res) => {
    console.log("/projects/:id");
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
    console.log("/projects/:id/members");
    // SELECT first_name, last_name FROM u158898485_coding4good.members INNER JOIN u158898485_coding4good.link_table
    // ON u158898485_coding4good.members.id=u158898485_coding4good.link_table.member_id WHERE project_id = 3;
    const query = `SELECT link_table.member_id, first_name, last_name FROM ${database}.members INNER JOIN ${database}.link_table ON ${database}.members.id=${database}.link_table.member_id WHERE project_id = ?`;
    console.log(query);
    pool.query(query, [sanatize(req.params.id)], (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No users found" });
        } else {
            res.json(results);
        }
    });
});

app.get("/projects/:id/skills", (req, res) => {
    console.log("/projects/:id/skills");
    // SELECT skills.id, skill_name FROM u158898485_coding4good.skills INNER JOIN u158898485_coding4good.project_skills
    // ON u158898485_coding4good.skills.id=u158898485_coding4good.project_skills.skill_id WHERE u158898485_coding4good.project_skills.project_id = 1;
    const query = `SELECT skills.id, skill_name FROM ${database}.skills INNER JOIN ${database}.project_skills ON ${database}.skills.id=${database}.project_skills.skill_id WHERE ${database}.project_skills.project_id = ?;`;
    console.log(query);
    pool.query(query, [sanatize(req.params.id)], (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No skills found" });
        } else {
            res.json(results);
        }
    });
});

app.get("/projects/:id/interests", (req, res) => {
    console.log("/projects/:id/interests");
    // SELECT interests.id, interest_name FROM u158898485_coding4good.interests INNER JOIN u158898485_coding4good.project_interests
    // ON u158898485_coding4good.interests.id=u158898485_coding4good.project_interests.interest_id WHERE u158898485_coding4good.project_interests.project_id = 1;
    const query = `SELECT interests.id, interest_name FROM ${database}.interests INNER JOIN ${database}.project_interests ON ${database}.interests.id=${database}.project_interests.interest_id WHERE ${database}.project_interests.project_id = ?;`;
    console.log(query);
    pool.query(query, [sanatize(req.params.id)], (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No interests found" });
        } else {
            res.json(results);
        }
    });
});

app.get("/projects/:id/updates", (req, res) => {
    console.log("/projects/:id/updates");
    const query = `SELECT * FROM ${database}.update_log WHERE project_id = ?`;
    console.log(query);
    pool.query(query, [sanatize(req.params.id)], (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No updates found" });
        } else {
            res.json(results);
        }
    });
});

app.post("/projects/:id/new-update", (req, res) => {
    console.log("/projects/:id/new-update");
    let params = req.body;
    // {
    //     member_id: #,
    //     date: YYYY-MM-DD,
    //     post_description: ["","",""],
    // };

    let flag = true;
    let error_code = "";
    let loop_variable = [];
    let full_query = `INSERT INTO ${database}.update_log (project_id, member_id, date, post_description) VALUES `;
    params.post_description.map((obj, key) => {
        loop_variable[key] = obj;
    });

    let final_query = secondaryMultiInsertQuery(
        full_query,
        [req.params.id, params.member_id, params.date],
        loop_variable
    );
    console.log(final_query);
    pool.query(final_query, (error) => {
        if (error) {
            flag = false;
            error_code = error.code;
        }
    });
    if ((flag = false)) {
        console.log("\x1b[31m", "error");
        res.json({
            error_message: `${error_code}: Inserting record failed!`,
        });
    } else {
        res.json({ data: params });
    }
});

app.post("/projects/:id/new-skills", (req, res) => {
    console.log("/projects/:id/new-skills");
    let params = req.body;
    let flag = true;
    let error_code = "";
    let loop_variable = [];
    let need_brackets = false;
    let full_query = `INSERT INTO ${database}.project_skills (project_id, skill_id) VALUES `;
    params.map((obj, key) => {
        loop_variable[key] = obj.skill_id;
    });
    let final_query = multiInsertQuery(
        full_query,
        [req.params.id],
        loop_variable,
        need_brackets
    );
    console.log(final_query);
    pool.query(final_query, (error) => {
        if (error) {
            flag = false;
            error_code = error.code;
        }
    });

    if ((flag = false)) {
        console.log("\x1b[31m", "error");
        res.json({
            error_message: `${error_code}: Inserting record failed!`,
        });
    } else {
        res.json({ data: params });
    }
});

app.post("/projects/:id/delete-skills", (req, res) => {
    console.log("/projects/:id/delete-skills");
    let params = req.body;
    let flag = true;
    let error_code = "";

    let loop_variable = [];
    let full_query = `DELETE FROM ${database}.project_skills WHERE (project_id, skill_id) IN `;
    params.map((obj, key) => {
        loop_variable[key] = obj.skill_id;
    });
    let final_query = multiInsertQuery(
        full_query,
        [req.params.id],
        loop_variable
    );
    console.log(final_query);
    pool.query(final_query, (error) => {
        if (error) {
            flag = false;
            error_code = error.code;
        }
    });
    if ((flag = false)) {
        console.log("\x1b[31m", "error");
        res.json({
            error_message: `${error_code}: Inserting record failed!`,
        });
    } else {
        res.json({ data: params });
    }
});

app.post("/projects/:id/new-interests", (req, res) => {
    console.log("/projects/:id/new-interests");
    let params = req.body;
    let flag = true;
    let error_code = "";
    let loop_variable = [];
    let need_brackets = false;
    let full_query = `INSERT INTO ${database}.project_interests (project_id, interest_id) VALUES `;
    params.map((obj, key) => {
        loop_variable[key] = obj.interest_id;
    });
    let final_query = multiInsertQuery(
        full_query,
        [req.params.id],
        loop_variable,
        need_brackets
    );
    console.log(final_query);
    pool.query(final_query, (error) => {
        if (error) {
            flag = false;
            error_code = error.code;
        }
    });
    if ((flag = false)) {
        console.log("\x1b[31m", "error");
        res.json({
            error_message: `${error_code}: Inserting record failed!`,
        });
    } else {
        res.json({ data: params });
    }
});

app.post("/projects/:id/delete-interests", (req, res) => {
    console.log("/projects/:id/delete-interests");
    let params = req.body;
    let flag = true;
    let error_code = "";
    let loop_variable = [];
    let full_query = `DELETE FROM ${database}.project_interests WHERE (project_id, interest_id) IN `;
    params.map((obj, key) => {
        loop_variable[key] = obj.interest_id;
    });
    let final_query = multiInsertQuery(
        full_query,
        [req.params.id],
        loop_variable
    );
    console.log(final_query);
    pool.query(final_query, (error) => {
        if (error) {
            flag = false;
            error_code = error.code;
        }
    });
    if ((flag = false)) {
        console.log("\x1b[31m", "error");
        res.json({
            error_message: `${error_code}: Inserting record failed!`,
        });
    } else {
        res.json({ data: params });
    }
});

app.post("/projects/:id/edit", (req, res) => {
    console.log("/projects/:id/edit");
    const data = {
        project_name: sanatize(req.body.project_name),
        description: sanatize(req.body.description),
        client: sanatize(req.body.client),
        status: sanatize(req.body.status),
    };
    const query = `UPDATE ${database}.projects SET project_name = ?, description = ?, client = ?, status = ? WHERE id = ?`;
    console.log(query);
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
    console.log("/login");
    // Test account passwords are "test"
    let params = req.body;
    const query = `SELECT id, first_name, last_name, password_hash FROM ${database}.members WHERE username = ?`;
    console.log(query);
    pool.query(query, [sanatize(params.username)], (error, results) => {
        if (!results[0]) {
            res.json({ error_message: "No user with that username found" });
        } else {
            if (results[0].password_hash == sanatize(params.password)) {
                let user_id = results[0].id;
                let first_name = results[0].first_name;
                let last_name = results[0].last_name;
                res.send({
                    token: true,
                    id: user_id,
                    first_name: first_name,
                    last_name: last_name,
                });
            } else {
                res.json({ error_message: "Password is invalid" });
            }
        }
    });
});

app.listen(port, () => {
    console.log(`Hosting on http://localhost:${port}`);
});
