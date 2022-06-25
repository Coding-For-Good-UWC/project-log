import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import PropTypes from "prop-types";

export default function NavBar({ setToken }) {
    const onClick = (e) => {
        e.preventDefault();
        localStorage.setItem("token", JSON.stringify({ token: false }));
        const token = JSON.parse(localStorage.getItem("token"));
        localStorage.removeItem("id");
        setToken(token);
    };
    return (
        <Navbar bg="dark" variant="dark">
            <Container>
                <Navbar.Brand href="/">Home</Navbar.Brand>
                <Nav className="justify-content-start">
                    <Nav.Link href="/profile">Profile</Nav.Link>
                </Nav>
                <Navbar.Collapse className="justify-content-end">
                    <Button variant="light" onClick={onClick}>
                        Log Out
                    </Button>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

NavBar.propTypes = {
    setToken: PropTypes.func.isRequired,
};
