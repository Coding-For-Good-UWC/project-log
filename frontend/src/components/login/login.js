import React, { useState } from "react";
import "./login.css";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import PropTypes from "prop-types";
import { sha256 } from "js-sha256";

async function loginUser(credentials) {
    return fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    }).then((data) => data.json());
}

// async function MemberInfo(id) {
//     return fetch("http://localhost:4000/members/" + id, {
//         method: "GET",
//     }).then((data) => data.json());
// }

export default function Login({ setToken }) {
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = await loginUser({
            username,
            password,
        });
        if("error_message" in token){
            alert("Incorrect credentials! Please try again.")
        }
        let name = token.first_name + " " + token.last_name;
        localStorage.setItem("name", JSON.stringify(name));
        localStorage.setItem("id", JSON.stringify(token.id));
        setToken(token);
    };

    return (
        <div className="login-wrapper">
            <h1>Log In</h1>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="username">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        type="name"
                        placeholder="Username"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        onChange={(e) => {
                            setPassword(sha256(e.target.value));
                        }}
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
        </div>
    );
}

Login.propTypes = {
    setToken: PropTypes.func.isRequired,
};
