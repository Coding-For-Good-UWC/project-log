import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Loading from "../../components/loading/loading";

async function GetAllSkills() {
    return fetch("http://localhost:4000/skills/", {
        method: "GET",
    }).then((data) => data.json());
}

async function GetAllInterests() {
    return fetch("http://localhost:4000/interests/", {
        method: "GET",
    }).then((data) => data.json());
}

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
    return fetch("http://localhost:4000/projects/" + id + "/new-update", {
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

async function RemoveSkillFromProject(id, skills) {
    return fetch("http://localhost:4000/projects/" + id + "/delete-skills", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(skills),
    }).then((data) => data.json());
}

async function AddSkillFromProject(id, skills) {
    return fetch("http://localhost:4000/projects/" + id + "/new-skills", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(skills),
    }).then((data) => data.json());
}

async function RemoveInterestFromProject(id, interests) {
    return fetch("http://localhost:4000/projects/" + id + "/delete-interests", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(interests),
    }).then((data) => data.json());
}

async function AddInterestFromProject(id, interests) {
    return fetch("http://localhost:4000/projects/" + id + "/new-interests", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(interests),
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
    const [allSkills, setAllSkills] = useState({});
    const [allInterests, setAllInterests] = useState({});
    const [members, setMembers] = useState([]);
    const [updates, setUpdates] = useState([]);
    const [inputList, setInputList] = useState([]);
    const [skills, setSkills] = useState([]);
    const [interests, setInterests] = useState([]);
    const bulletPoints = useRef([]);
    const [refresh, setRefresh] = useState(true);
    const [name, setName] = useState({});
    const [description, setDescription] = useState({});
    const [client, setClient] = useState({});
    const [status, setStatus] = useState({});
    const [editable, setEditable] = useState(false);
    const [showSkills, setShowSkills] = useState(false);
    const [skillEditList, setSkillEditList] = useState([]);
    const skillResultList = useRef([]);
    const [showInterests, setShowInterests] = useState(false);
    const [interestEditList, setInterestEditList] = useState([]);
    const interestResultList = useRef([]);

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

    const handleSkillsClose = () => {
        setShowSkills(false);
    };
    const handleSkillsShow = () => {
        // {
        //     id: #
        //     skill_name: "NAME"
        //     is_selected: true/false
        // }
        let resultsList = [];
        for (let i = 0; i < allSkills.length; i++) {
            let item = {};
            item.id = allSkills[i].id;
            item.skill_name = allSkills[i].skill_name;
            let flag = false;
            for (let j = 0; j < skills.length; j++) {
                if (allSkills[i].skill_name == skills[j].skill_name) {
                    flag = true;
                }
            }
            item.is_selected = flag;
            resultsList.push(item);
        }
        skillResultList.current = resultsList;
        // console.log(resultsList);
        let editList = [];
        for (let i = 0; i < allSkills.length; i++) {
            editList.push(
                <Form.Check
                    key={i}
                    iteration={i}
                    skillid={resultsList[i].id}
                    label={resultsList[i].skill_name}
                    defaultChecked={resultsList[i].is_selected}
                    onChange={(e) => {
                        let a = skillResultList.current;
                        let i = e.target.getAttribute("iteration");
                        let bool = !a[i].is_selected;
                        a[i].is_selected = bool;
                        skillResultList.current = a;
                    }}
                ></Form.Check>
            );
        }

        setSkillEditList(editList);
        setShowSkills(true);
    };

    const handleInterestsClose = () => {
        setShowInterests(false);
    };
    const handleInterestsShow = () => {
        // {
        //     id: #
        //     skill_name: "NAME"
        //     is_selected: true/false
        // }
        let resultsList = [];
        for (let i = 0; i < allInterests.length; i++) {
            let item = {};
            item.id = allInterests[i].id;
            item.interest_name = allInterests[i].interest_name;
            let flag = false;
            for (let j = 0; j < interests.length; j++) {
                if (
                    allInterests[i].interest_name == interests[j].interest_name
                ) {
                    flag = true;
                }
            }
            item.is_selected = flag;
            resultsList.push(item);
        }
        interestResultList.current = resultsList;
        // console.log(resultsList);
        let editList = [];
        for (let i = 0; i < allInterests.length; i++) {
            editList.push(
                <Form.Check
                    key={i}
                    iteration={i}
                    skillid={resultsList[i].id}
                    label={resultsList[i].interest_name}
                    defaultChecked={resultsList[i].is_selected}
                    onChange={(e) => {
                        let a = interestResultList.current;
                        let i = e.target.getAttribute("iteration");
                        let bool = !a[i].is_selected;
                        a[i].is_selected = bool;
                        interestResultList.current = a;
                    }}
                ></Form.Check>
            );
        }

        setInterestEditList(editList);
        setShowInterests(true);
    };

    const getData = async () => {
        const projectInfo = await ProjectInfo(id);
        setProjects(projectInfo);
        const allSkills = await GetAllSkills();
        setAllSkills(allSkills);
        const allInterests = await GetAllInterests();
        setAllInterests(allInterests);
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
        bulletPoints.current.push("");
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
        bulletPoints.current = [];
        setRefresh(!refresh);
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

    const skillsEdit = async (event) => {
        event.preventDefault();
        let deleteList = [];
        let addList = [];
        let skillList = skillResultList.current;
        let projectSkills = skills;
        for (let i = 0; i < projectSkills.length; i++) {
            for (let j = 0; j < skillList.length; j++) {
                if (projectSkills[i].id == skillList[j].id) {
                    if (skillList[j].is_selected == false) {
                        deleteList.push({ skill_id: skillList[j].id });
                        // console.log("Removing " + skillList[j].skill_name);
                    }
                    skillList.splice(j, 1);
                }
            }
        }

        for (let i = 0; i < skillList.length; i++) {
            if (skillList[i].is_selected == true) {
                addList.push({ skill_id: skillList[i].id });
                // console.log("Adding " + skillList[i].skill_name);
            }
        }

        if (deleteList.length != 0) {
            await RemoveSkillFromProject(id, deleteList);
            await getData();
        }
        if (addList.length != 0) {
            await AddSkillFromProject(id, addList);
            await getData();
        }
    };

    const interestsEdit = async (event) => {
        event.preventDefault();
        let deleteList = [];
        let addList = [];
        let interestList = interestResultList.current;
        let projectInterests = interests;
        for (let i = 0; i < projectInterests.length; i++) {
            for (let j = 0; j < interestList.length; j++) {
                if (projectInterests[i].id == interestList[j].id) {
                    if (interestList[j].is_selected == false) {
                        deleteList.push({ interest_id: interestList[j].id });
                        // console.log("Removing " + interestList[j].interest_name);
                    }
                    interestList.splice(j, 1);
                }
            }
        }

        for (let i = 0; i < interestList.length; i++) {
            if (interestList[i].is_selected == true) {
                addList.push({ interest_id: interestList[i].id });
                // console.log("Adding " + interestList[i].interest_name);
            }
        }

        if (deleteList.length != 0) {
            await RemoveInterestFromProject(id, deleteList);
            await getData();
        }
        if (addList.length != 0) {
            await AddInterestFromProject(id, addList);
            await getData();
        }
    };

    // update_log
    let prev_date = "";

    return (
        <Container className="pt-5">
            {loading ? (
                <Loading />
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
                    <Modal show={showSkills} onHide={handleSkillsClose}>
                        <Form onSubmit={skillsEdit}>
                            <Modal.Header closeButton>
                                <Modal.Title>Skill List</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form.Label>
                                    Click on every item that is relevant.
                                </Form.Label>
                                {skillEditList}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button
                                    variant="secondary"
                                    onClick={handleSkillsClose}
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    onClick={handleSkillsClose}
                                >
                                    Save Changes
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
                    <Modal show={showInterests} onHide={handleInterestsClose}>
                        <Form onSubmit={interestsEdit}>
                            <Modal.Header closeButton>
                                <Modal.Title>Interest List</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form.Label>
                                    Click on every item that is relevant.
                                </Form.Label>
                                {interestEditList}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button
                                    variant="secondary"
                                    onClick={handleInterestsClose}
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    onClick={handleInterestsClose}
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
                                <p>
                                    {skills.map((obj, key) => {
                                        if (skills.length == key + 1) {
                                            return obj.skill_name;
                                        }
                                        return obj.skill_name + ", ";
                                    })}
                                </p>
                            )}
                            <Button
                                variant="dark"
                                hidden={!editable}
                                onClick={handleSkillsShow}
                            >
                                Edit Skills
                            </Button>
                        </Col>
                        <Col>
                            <h3>Interests</h3>
                            {interests.length == 0 ? (
                                <p>There are no interests listed currently.</p>
                            ) : (
                                <p>
                                    {interests.map((obj, key) => {
                                        if (interests.length == key + 1) {
                                            return obj.interest_name;
                                        }
                                        return obj.interest_name + ", ";
                                    })}
                                </p>
                            )}
                            <Button
                                variant="dark"
                                hidden={!editable}
                                onClick={handleInterestsShow}
                            >
                                Edit Interests
                            </Button>
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
