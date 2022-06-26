import React, { useState, useRef } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

async function ProjectInfo() {
    return fetch("http://localhost:4000/", {
        method: "GET",
    }).then((data) => data.json());
}

async function MemberInfo(id) {
    return fetch("http://localhost:4000/members/" + id, {
        method: "GET",
    }).then((data) => data.json());
}

async function GetSkills(id) {
    return fetch("http://localhost:4000/members/" + id + "/skills", {
        method: "GET",
    }).then((data) => data.json());
}

async function GetInterest(id) {
    return fetch("http://localhost:4000/members/" + id + "/interests", {
        method: "GET",
    }).then((data) => data.json());
}

async function GetProjects(id) {
    return fetch("http://localhost:4000/members/" + id + "/projects", {
        method: "GET",
    }).then((data) => data.json());
}

async function updateProjects(id, new_projects) {
    return fetch("http://localhost:4000/members/" + id + "/new-projects", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(new_projects),
    }).then((data) => data.json());
}

async function deleteProjects(id, removedList) {
    return fetch("http://localhost:4000/members/" + id + "/remove-projects", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(removedList),
    }).then((data) => data.json());
}

export default function Profile(props) {
    const [loading, setLoading] = useState(true);
    const [show, setShow] = useState(false);
    const [showRemove, setShowRemove] = useState(false);
    const [member, setMember] = useState({});
    const [skills, setSkills] = useState([]);
    const [interests, setInterests] = useState([]);
    const [projects, setProjects] = useState([]);
    const [allProjects, setAllProjects] = useState([]);
    const [inputList, setInputList] = useState([]);
    const projectList = useRef([]);
    const userProjectsList = useRef([]);
    const userRemoveList = useRef([]);
    const [removeList, setRemoveList] = useState([]);

    let id = props.value;

    const handleClose = () => {
        setShow(false);
    };
    const handleShow = () => {
        let temp = [];
        for (let i = 0; i < projects.length; i++) {
            if ("id" in projects[i]) {
                projectList.current[i] = projects[i].id.toString();
                userProjectsList.current[i] = projects[i].id.toString();
                temp.push(
                    <Form.Select
                        key={i}
                        iteration={i}
                        className="mt-2"
                        onChange={(e) => {
                            projectList.current[
                                e.target.getAttribute("iteration")
                            ] = e.target.value;
                        }}
                    >
                        <option key={i} value={projects[i].id}>
                            {projects[i].project_name}
                        </option>
                    </Form.Select>
                );
            }
        }
        setInputList(temp);
        setShow(true);
    };

    const handleRemoveClose = () => {
        setShowRemove(false);
    };
    const handleRemoveShow = () => {
        let temp = [];
        for (let i = 0; i < projects.length; i++) {
            if ("id" in projects[i]) {
                userRemoveList.current[i] = [projects[i].id.toString(), false];
                temp.push(
                    <Form.Check
                        key={i}
                        iteration={i}
                        projectid={projects[i].id.toString()}
                        label={projects[i].project_name}
                        onChange={(e) => {
                            userRemoveList.current[
                                e.target.getAttribute("iteration")
                            ] = [projects[i].id.toString(), e.target.checked];
                        }}
                    ></Form.Check>
                );
            } else {
                temp = <p>You have no projects.</p>;
            }
        }
        setRemoveList(temp);
        setShowRemove(true);
    };

    const getData = async () => {
        const memberInfo = await MemberInfo(id);
        setMember(memberInfo);
        const skillsInfo = await GetSkills(id);
        if ("error_message" in skillsInfo) {
            setSkills([]);
        } else {
            setSkills(skillsInfo);
        }
        const interestsInfo = await GetInterest(id);
        if ("error_message" in interestsInfo) {
            setInterests([]);
        } else {
            setInterests(interestsInfo);
        }
        // User's Projects
        const projectNames = await GetProjects(id);
        if ("error_message" in projectNames) {
            setProjects([{ project_name: projectNames.error_message }]);
        } else {
            setProjects(projectNames);
        }
        // All Projects
        const allProjectsList = await ProjectInfo();
        if ("error_message" in allProjectsList) {
            setAllProjects([allProjectsList.error_message]);
        } else {
            setAllProjects(allProjectsList);
        }
        setLoading(false);
    };

    const addProjects = async (event) => {
        event.preventDefault();
        // Removing duplicates
        let projectsL = projectList.current;
        projectsL = projectsL.filter(function (item, pos) {
            return projectsL.indexOf(item) == pos;
        });

        // Removing original user projects
        let userProjects = userProjectsList.current;
        let userProjectSet = new Set(userProjects);
        projectsL = projectsL.filter((name) => {
            return !userProjectSet.has(name);
        });
        let output = {
            project_ids: projectsL,
        };
        const result = await updateProjects(id, output);
        getData();
    };

    const removeProjects = async (event) => {
        event.preventDefault();
        let removedProject = userRemoveList.current;
        let removedList = [];
        for (let i = 0; i < removedProject.length; i++) {
            if (removedProject[i][1] == true) {
                removedList.push(removedProject[i][0]);
            }
        }
        const result = await deleteProjects(id, removedList);
        getData();
    };

    const onAddBtnClick = (event) => {
        setInputList(
            inputList.concat(
                <Form.Select
                    key={inputList.length}
                    iteration={inputList.length}
                    className="mt-2"
                    onChange={(e) => {
                        projectList.current[
                            e.target.getAttribute("iteration")
                        ] = e.target.value;
                    }}
                >
                    <option>Choose a Project</option>
                    {allProjects.map((obj, key) => {
                        return (
                            <option key={key} value={obj.id}>
                                {obj.project_name}
                            </option>
                        );
                    })}
                </Form.Select>
            )
        );
        projectList.current.push("");
    };

    if (loading == true) {
        getData();
    }

    return (
        <Container>
            {loading ? (
                <h1>Loading Data</h1>
            ) : (
                <>
                    <Modal show={show} onHide={handleClose}>
                        <Form onSubmit={addProjects}>
                            <Modal.Header closeButton>
                                <Modal.Title>Project List</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form.Label>Projects</Form.Label>
                                {inputList}
                                <Button
                                    variant="primary"
                                    className="mt-2 p-2 w-100"
                                    onClick={onAddBtnClick}
                                >
                                    + Add Projects
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
                    <Modal show={showRemove} onHide={handleRemoveClose}>
                        <Form onSubmit={removeProjects}>
                            <Modal.Header closeButton>
                                <Modal.Title>Project List</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form.Label>
                                    Click the Projects to Remove It
                                </Form.Label>
                                {removeList}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button
                                    variant="secondary"
                                    onClick={handleRemoveClose}
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    onClick={handleRemoveClose}
                                >
                                    Save Changes
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
                    <Row className="pt-5">
                        <Col xs={6}>
                            <Row className="pb-5">
                                <Col>
                                    <div
                                        className="shadow pb-5"
                                        style={{
                                            borderRadius: "1rem",
                                            paddingLeft: "0",
                                            paddingRight: "0",
                                        }}
                                    >
                                        <div
                                            className="ps-3 pt-4 pb-4 bg-dark"
                                            style={{
                                                borderTopLeftRadius: "1rem",
                                                borderTopRightRadius: "1rem",
                                            }}
                                        >
                                            <h4 style={{ color: "white" }}>
                                                {member.first_name}{" "}
                                                {member.last_name}
                                            </h4>
                                            <h6 style={{ color: "white" }}>
                                                @{member.username}
                                            </h6>
                                        </div>
                                        <div className="pt-5 pb-3 ps-3">
                                            <h6>
                                                Class of{" "}
                                                {member.graduating_year}
                                            </h6>
                                            <h6>Role: {member.role}</h6>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <div
                                        className="shadow pb-5"
                                        style={{
                                            borderRadius: "1rem",
                                            paddingLeft: "0",
                                            paddingRight: "0",
                                        }}
                                    >
                                        <div
                                            className="ps-3 pt-4 pb-4 bg-dark"
                                            style={{
                                                borderTopLeftRadius: "1rem",
                                                borderTopRightRadius: "1rem",
                                            }}
                                        >
                                            <h4 style={{ color: "white" }}>
                                                Skills
                                            </h4>
                                        </div>
                                        <div className="pt-5 pb-3 ps-3">
                                            <ul>
                                                {skills.length == 0 ? (
                                                    <li>
                                                        There are no skills
                                                        listed currently.
                                                    </li>
                                                ) : (
                                                    <li>
                                                        {skills.map(
                                                            (obj, key) => {
                                                                return (
                                                                    <li
                                                                        key={
                                                                            key
                                                                        }
                                                                    >
                                                                        {
                                                                            obj.skill_name
                                                                        }
                                                                    </li>
                                                                );
                                                            }
                                                        )}
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                        <Col xs={6}>
                            <Row className="pb-5">
                                <Col>
                                    <div
                                        className="shadow pb-5"
                                        style={{
                                            borderRadius: "1rem",
                                            paddingLeft: "0",
                                            paddingRight: "0",
                                        }}
                                    >
                                        <div
                                            className="ps-3 pt-4 pb-4 bg-dark"
                                            style={{
                                                borderTopLeftRadius: "1rem",
                                                borderTopRightRadius: "1rem",
                                            }}
                                        >
                                            <h4 style={{ color: "white" }}>
                                                Projects
                                            </h4>
                                        </div>
                                        <div className="pt-5 ps-3">
                                            <ul>
                                                {projects.map((obj, key) => {
                                                    return (
                                                        <li key={key}>
                                                            {obj.project_name}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                            <div className="pt-2 text-center">
                                                <Button
                                                    variant="dark"
                                                    onClick={handleShow}
                                                >
                                                    Add Projects
                                                </Button>
                                                <Button
                                                    className="ms-2"
                                                    variant="danger"
                                                    onClick={handleRemoveShow}
                                                >
                                                    Remove Projects
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <div
                                        className="shadow pb-5"
                                        style={{
                                            borderRadius: "1rem",
                                            paddingLeft: "0",
                                            paddingRight: "0",
                                        }}
                                    >
                                        <div
                                            className="ps-3 pt-4 pb-4 bg-dark"
                                            style={{
                                                borderTopLeftRadius: "1rem",
                                                borderTopRightRadius: "1rem",
                                            }}
                                        >
                                            <h4 style={{ color: "white" }}>
                                                Interests
                                            </h4>
                                        </div>
                                        <div className="pt-5 pb-3 ps-3">
                                            <ul>
                                                {interests.length == 0 ? (
                                                    <li>
                                                        There are no interests
                                                        listed currently.
                                                    </li>
                                                ) : (
                                                    <li>
                                                        {interests.map(
                                                            (obj, key) => {
                                                                return (
                                                                    <li
                                                                        key={
                                                                            key
                                                                        }
                                                                    >
                                                                        {
                                                                            obj.interest_name
                                                                        }
                                                                    </li>
                                                                );
                                                            }
                                                        )}
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    );
}
