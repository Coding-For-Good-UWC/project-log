import React from "react";
import NavBar from "../../components/navbar/navbar";
import Container from "react-bootstrap/Container";

export default function Dashboard(props) {
    return (
        <Container>
            <p className="text-center">Profile: {props.value} </p>
        </Container>
    );
}
