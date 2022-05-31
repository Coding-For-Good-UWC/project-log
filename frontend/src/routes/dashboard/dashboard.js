import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

async function ProjectInfo() {
    return fetch("http://localhost:4000/", {
        method: "GET",
    }).then((data) => data.json());
}

export default function Dashboard() {
    const [projects, setProjects] = useState({});
    const [loading, setLoading] = useState(true);
    const [projectFromDatabase, setProjectFromDatabase] = useState({});

    const getProjects = async () => {
        const projectInfo = await ProjectInfo();
        // console.log(projectInfo);
        setProjectFromDatabase(projectInfo);
        setProjects(projectInfo);
        setLoading(false);
    };

    if (loading == true) {
        getProjects();
    }

    let searchParams = {
        id: "",
        project_name: "",
        client: "",
        status: "",
    };

    const searchParamChange = () => {
        searchParams.id = document.getElementById("id").value;
        searchParams.project_name =
            document.getElementById("project_name").value;
        searchParams.client = document.getElementById("client").value;
        if (document.getElementById("status").value != "Choose a Status") {
            searchParams.status = document.getElementById("status").value;
        } else {
            searchParams.status = "";
        }
    };

    const searchField = () => {
        searchParamChange();

        console.log(searchParams);

        let output = projectFromDatabase;

        let filter = searchParams;

        let count = 0;

        for (let i in searchParams) {
            if (searchParams[i] == "") {
                count += 1;
                delete filter[i];
            }
        }

        output = projectFromDatabase.filter(function (element) {
            for (let i in filter) {
                if (
                    !element[i]
                        .toString()
                        .toLowerCase()
                        .includes(filter[i].toLowerCase())
                )
                    return false;
            }
            return true;
        });

        console.log(count);

        if (count == 4) {
            output = projectFromDatabase;
        }

        // if (output.length == 0) {
        //     output = projectFromDatabase;
        // }

        setProjects(output);
    };

    return (
        <Container className="pt-5">
            {loading ? (
                <h1>Loading Table</h1>
            ) : (
                <>
                    <div className="p-2 pb-5">
                        <Row>
                            <Col xs={4}>
                                <h4 className="pt-4">
                                    Narrow your search to...
                                </h4>
                            </Col>
                            <Col xs={1}>
                                <Form.Label>ID</Form.Label>
                                <Form.Control
                                    id="id"
                                    type="name"
                                    onChange={(e) => {
                                        // searchParams["id"] = e.target.value;
                                        searchField();
                                    }}
                                />
                            </Col>
                            <Col xs={3}>
                                <Form.Label>Project Name</Form.Label>
                                <Form.Control
                                    id="project_name"
                                    type="name"
                                    onChange={(e) => {
                                        // searchParams["project_name"] =
                                        //     e.target.value;
                                        searchField();
                                    }}
                                />
                            </Col>
                            <Col xs={2}>
                                <Form.Label>Client</Form.Label>
                                <Form.Control
                                    id="client"
                                    type="name"
                                    onChange={(e) => {
                                        // searchParams["client"] = e.target.value;
                                        searchField();
                                    }}
                                />
                            </Col>
                            <Col xs={2}>
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    id="status"
                                    onChange={(e) => {
                                        // searchParams["status"] = e.target.value;
                                        searchField();
                                    }}
                                >
                                    <option>Choose a Status</option>
                                    <option>Proposed</option>
                                    <option>In Progress</option>
                                    <option>Needs Documentation</option>
                                    <option>Complete</option>
                                    <option>Frozen</option>
                                    <option>Rejected</option>
                                </Form.Select>
                            </Col>
                        </Row>
                    </div>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Project Name</th>
                                <th>Description</th>
                                <th>Client</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((obj, key) => {
                                return (
                                    <tr key={key}>
                                        <td>{obj["id"]}</td>
                                        <td>{obj["project_name"]}</td>
                                        <td>{obj["description"]}</td>
                                        <td>{obj["client"]}</td>
                                        <td>{obj["status"]}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </>
            )}
        </Container>
    );
}
