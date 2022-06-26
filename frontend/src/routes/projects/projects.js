import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

async function ProjectInfo(id) {
    return fetch("http://localhost:4000/projects/" + id, {
        method: "GET",
    }).then((data) => data.json());
}

async function ProjectMembers(id) {
    return fetch("http://localhost:4000/projects/" + id + "/members", {
        method: "GET",
    }).then((data) => data.json());
}
async function ProjectUpdates(id) {
    return fetch("http://localhost:4000/projects/" + id + "/updates", {
        method: "GET",
    }).then((data) => data.json());
}

async function ProjectSkills(id) {
    return fetch("http://localhost:4000/projects/" + id + "/skills", {
        method: "GET",
    }).then((data) => data.json());
}

async function ProjectInterests(id) {
    return fetch("http://localhost:4000/projects/" + id + "/interests", {
        method: "GET",
    }).then((data) => data.json());
}

async function newUpdates(id, updates) {
    return fetch("http://localhost:4000/projects/" + id + "/new", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
    }).then((data) => data.json());
}

async function updateDetails(id, details) {
    return fetch("http://localhost:4000/projects/" + id + "/edit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(details),
    }).then((data) => data.json());
}

// input: 2022-06-17T16:00:00.000Z
// output: 06/17/22
function FormatDate(input) {
    let year = input.substring(2, 4);
    let month = input.substring(5, 7);
    let day = input.substring(8, 10);
    return month + "/" + day + "/" + year;
}

function CurrentDate() {
    let d = new Date();
    let month = (d.getMonth() + 1).toString();
    let day = d.getDate().toString();

    if (month.length == 1) {
        month = "0" + month;
    }

    if (day.length == 1) {
        day = "0" + day;
    }

    // YYYY-MM-DD
    return d.getFullYear() + "-" + month + "-" + day;
}

export default function Projects() {
    const [show, setShow] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState({});
    const [members, setMembers] = useState([]);
    const [updates, setUpdates] = useState([]);
    const [inputList, setInputList] = useState([]);
    const [skills, setSkills] = useState([]);
    const [interests, setInterests] = useState([]);
    const bulletPoints = useRef([]);
    const [name, setName] = useState({});
    const [description, setDescription] = useState({});
    const [client, setClient] = useState({});
    const [status, setStatus] = useState({});
    const [editable, setEditable] = useState(false);

    let { id } = useParams();

    const isAMember = () => {
        let flag = false;
        for (let i = 0; i < members.length; i++) {
            if (localStorage.getItem("id") == members[i].member_id.toString()) {
                flag = true;
            }
        }
        return flag;
    };

    const handleClose = () => {
        setShow(false);
    };
    const handleShow = () => {
        setInputList([]);
        setShow(true);
    };
    const handleCloseEdit = () => {
        setShowEdit(false);
    };
    const handleShowEdit = () => {
        setShowEdit(true);
    };

    const getData = async () => {
        const projectInfo = await ProjectInfo(id);
        setProjects(projectInfo);
        const projectMembers = await ProjectMembers(id);
        if (projectMembers.length > 0) {
            setMembers(projectMembers);
            setEditable(isAMember);
        }
        const projectUpdates = await ProjectUpdates(id);
        if (projectUpdates.length > 0) {
            let sortedProjectUpdates = projectUpdates.sort(function (a, b) {
                // Turn your strings into dates, and then subtract them
                // to get a value that is either negative, positive, or zero.
                return new Date(b.date) - new Date(a.date);
            });
            setUpdates(sortedProjectUpdates);
        } else {
            setUpdates([]);
        }
        setName(projects.project_name);
        setDescription(projects.description);
        setClient(projects.client);
        setStatus(projects.status);
        const s = await ProjectSkills(id);
        if ("error_message" in s) {
            setSkills([]);
        } else {
            setSkills(s);
        }
        const i = await ProjectInterests(id);
        if ("error_message" in i) {
            setInterests([]);
        } else {
            setInterests(i);
        }
        setLoading(false);
    };

    if (loading == true) {
        getData();
    }

    const onAddBtnClick = (event) => {
        setInputList(
            inputList.concat(
                <Form.Control
                    key={inputList.length}
                    iteration={inputList.length}
                    className="mt-2"
                    type="text"
                    placeholder={"Bullet Point " + inputList.length + ": "}
                    onChange={(e) => {
                        bulletPoints.current[
                            e.target.getAttribute("iteration")
                        ] = e.target.value;
                    }}
                />
            )
        );
        bulletPoints.current.push("");
    };

    const insertUpdates = async (event) => {
        event.preventDefault();
        let bulletpoints = bulletPoints.current;
        let date = CurrentDate();
        let output = {
            member_id: localStorage.getItem("id"),
            date: date,
            post_description: bulletpoints,
        };
        const result = await newUpdates(id, output);
    };

    const editDetails = async (event) => {
        event.preventDefault();
        let details = {
            project_name: name,
            description: description,
            client: client,
            status: status,
        };
        const result = await updateDetails(id, details);
        const updated_details = await ProjectInfo(id);
        setProjects(updated_details);
    };

    // update_log
    let prev_date = "";

    return (
        <Container className="pt-5">
            {loading ? (
                <h1>Loading Data</h1>
            ) : (
                <>
                    <Modal show={show} onHide={handleClose}>
                        <Form onSubmit={insertUpdates}>
                            <Modal.Header closeButton>
                                <Modal.Title>New Update</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form.Label>Updates</Form.Label>
                                {inputList}
                                <Button
                                    variant="primary"
                                    className="mt-2 p-2 w-100"
                                    onClick={onAddBtnClick}
                                >
                                    + Add Bullet Point
                                </Button>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button
                                    variant="secondary"
                                    onClick={handleClose}
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    onClick={handleClose}
                                >
                                    Save Changes
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
                    <Modal show={showEdit} onHide={handleCloseEdit}>
                        <Form onSubmit={editDetails}>
                            <Modal.Header closeButton>
                                <Modal.Title>Edit Project Details</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form.Label>Project Name</Form.Label>
                                <Form.Control
                                    className="mb-2"
                                    type="text"
                                    placeholder="Project Name"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                    }}
                                />
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    className="mb-2"
                                    as="textarea"
                                    placeholder="Project Description"
                                    rows={5}
                                    value={description}
                                    onChange={(e) => {
                                        setDescription(e.target.value);
                                    }}
                                />
                                <Form.Label>Client</Form.Label>
                                <Form.Control
                                    className="mb-2"
                                    type="text"
                                    placeholder="Client"
                                    value={client}
                                    onChange={(e) => {
                                        setClient(e.target.value);
                                    }}
                                />
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    id="status"
                                    value={status}
                                    onChange={(e) => {
                                        setStatus(e.target.value);
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
                            </Modal.Body>
                            <Modal.Footer>
                                <Button
                                    variant="secondary"
                                    onClick={handleCloseEdit}
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    onClick={handleCloseEdit}
                                >
                                    Save Changes
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
                    <Row>
                        <Col>
                            <h1>
                                Project {id}: {projects.project_name}
                            </h1>
                            <p>{projects.description}</p>
                        </Col>
                        <Col>
                            <Table striped bordered>
                                <tbody>
                                    <tr>
                                        <th>ID</th>
                                        <td>{projects.id}</td>
                                    </tr>
                                    <tr>
                                        <th>Project Name</th>
                                        <td>{projects.project_name}</td>
                                    </tr>
                                    <tr>
                                        <th>Client</th>
                                        <td>{projects.client}</td>
                                    </tr>
                                    <tr>
                                        <th>Status</th>
                                        <td>{projects.status}</td>
                                    </tr>
                                    <tr>
                                        <th>Members</th>
                                        <td>
                                            {members.length == 0 ? (
                                                <p>
                                                    There are currently no
                                                    members working on this
                                                    project. If you would like
                                                    to join this project, please
                                                    add it to your project list
                                                    on your profile page.
                                                </p>
                                            ) : (
                                                <>
                                                    {members.map((obj, key) => {
                                                        if (
                                                            members.length ==
                                                            key + 1
                                                        ) {
                                                            return (
                                                                obj.first_name +
                                                                " " +
                                                                obj.last_name
                                                            );
                                                        }
                                                        return (
                                                            obj.first_name +
                                                            " " +
                                                            obj.last_name +
                                                            ", "
                                                        );
                                                    })}
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>

                            <Button
                                hidden={!editable}
                                variant="dark"
                                onClick={handleShowEdit}
                            >
                                Edit Project Details
                            </Button>
                        </Col>
                    </Row>
                    <Row className="pt-5 pb-5">
                        <Col>
                            <h3>Skills</h3>
                            {skills.length == 0 ? (
                                <p>There are no skills listed currently.</p>
                            ) : (
                                <>
                                    {skills.map((obj, key) => {
                                        if (skills.length == key + 1) {
                                            return obj.skill_name;
                                        }
                                        return obj.skill_name + ", ";
                                    })}
                                </>
                            )}
                        </Col>
                        <Col>
                            <h3>Interests</h3>
                            {interests.length == 0 ? (
                                <p>There are no interests listed currently.</p>
                            ) : (
                                <>
                                    {interests.map((obj, key) => {
                                        if (interests.length == key + 1) {
                                            return obj.interest_name;
                                        }
                                        return obj.interest_name + ", ";
                                    })}
                                </>
                            )}
                        </Col>
                    </Row>
                    <Row className="pb-5">
                        <Col>
                            <h3>Update Log</h3>
                            <Button
                                hidden={!editable}
                                variant="dark"
                                onClick={handleShow}
                            >
                                New Update
                            </Button>
                        </Col>
                    </Row>
                    <Row>
                        {updates.length == 0 ? (
                            <p>There are no updates!</p>
                        ) : (
                            <>
                                {updates.map((obj, key) => {
                                    if (prev_date == "") {
                                        prev_date = FormatDate(obj.date);
                                        return (
                                            <div key={key}>
                                                <h4>{prev_date}</h4>
                                                <li>{obj.post_description}</li>
                                            </div>
                                        );
                                    } else if (
                                        prev_date == FormatDate(obj.date)
                                    ) {
                                        return (
                                            <div key={key}>
                                                <li>{obj.post_description}</li>
                                            </div>
                                        );
                                    } else {
                                        prev_date = FormatDate(obj.date);
                                        return (
                                            <div key={key}>
                                                <h4>{prev_date}</h4>
                                                <li>{obj.post_description}</li>
                                            </div>
                                        );
                                    }
                                })}
                            </>
                        )}
                    </Row>
                </>
            )}
        </Container>
    );
}
