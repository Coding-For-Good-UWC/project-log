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

async function GetAllProjectSkills() {
    return fetch("http://localhost:4000/all-project-skills/", {
        method: "GET",
    }).then((data) => data.json());
}

async function GetAllProjectInterests() {
    return fetch("http://localhost:4000/all-project-interests/", {
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

async function RemoveSkillFromMember(id, skills) {
    return fetch("http://localhost:4000/members/" + id + "/delete-skills", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(skills),
    }).then((data) => data.json());
}

async function AddSkillFromMember(id, skills) {
    return fetch("http://localhost:4000/members/" + id + "/new-skills", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(skills),
    }).then((data) => data.json());
}

async function RemoveInterestFromMember(id, interests) {
    return fetch("http://localhost:4000/members/" + id + "/delete-interests", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(interests),
    }).then((data) => data.json());
}

async function AddInterestFromMember(id, interests) {
    return fetch("http://localhost:4000/members/" + id + "/new-interests", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(interests),
    }).then((data) => data.json());
}

// No nested bs
function ArraysAreEqual(array_one, array_two) {
    if (!array_one) return false;
    if (!array_two) return false;
    if (array_one.length != array_two.length) return false;
    for (var i = 0, l = array_one.length; i < l; i++) {
        if (array_one[i] != array_two[i]) {
            return false;
        }
    }
    return true;
}

export default function Profile(props) {
    const [loading, setLoading] = useState(true);
    const [show, setShow] = useState(false);
    const [allSkills, setAllSkills] = useState({});
    const [allInterests, setAllInterests] = useState({});
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
    const [showSkills, setShowSkills] = useState(false);
    const [skillEditList, setSkillEditList] = useState([]);
    const skillResultList = useRef([]);
    const [showInterests, setShowInterests] = useState(false);
    const [interestEditList, setInterestEditList] = useState([]);
    const interestResultList = useRef([]);
    const [recommendedProject, setRecommendedProject] = useState([]);
    const [allProjectSkills, setAllProjectSkills] = useState([]);
    const [allProjectInterests, setAllProjectInterests] = useState([]);

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

    //TODO
    const recommenderAlgo = () => {
        let skill_similarity_list = [];
        let interest_similarity_list = [];
        let aggregate_similarity_list = [];
        const SimilarityTier = {
            S: "S",
            A: "A",
            B: "B",
            C: "C",
            D: "D",
        };
        let user_skills_id = [];
        skills.map((obj, key) => {
            user_skills_id[key] = obj.id;
        });

        for (let i = 0; i < allProjectSkills.length; i++) {
            let one_or_more_match = false;
            let relevant_skill_list = [];
            let project_skills_in_this_iteration = allProjectSkills[i].skill_id;
            for (let j = 0; j < project_skills_in_this_iteration.length; j++) {
                for (let k = 0; k < skills.length; k++) {
                    if (project_skills_in_this_iteration[j] == skills[k].id) {
                        relevant_skill_list.push(skills[k].id);
                        one_or_more_match = true;
                    }
                }
            }
            if (
                ArraysAreEqual(user_skills_id, project_skills_in_this_iteration)
            ) {
                // Type S scenario | 100% Match
                skill_similarity_list.push({
                    project_id: allProjectSkills[i].id,
                    project_name: allProjectSkills[i].project_name,
                    skill_id: relevant_skill_list,
                    skill_similarity: 100,
                    type: SimilarityTier.S,
                });
            } else if (
                user_skills_id.length >
                    project_skills_in_this_iteration.length &&
                user_skills_id.some((r) =>
                    project_skills_in_this_iteration.includes(r)
                )
            ) {
                // Type A scenario | user_skills_id.length > project_skills_in_this_iteration.length | user_skills_id includes project_skills
                skill_similarity_list.push({
                    project_id: allProjectSkills[i].id,
                    project_name: allProjectSkills[i].project_name,
                    skill_id: relevant_skill_list,
                    skill_similarity: 100,
                    type: SimilarityTier.A,
                });
            } else if (
                project_skills_in_this_iteration.length >
                    user_skills_id.length &&
                project_skills_in_this_iteration.some((r) =>
                    user_skills_id.includes(r)
                )
            ) {
                // Type C scenario | project_skills_in_this_iteration.length > user_skills_id.length | project_skills_in_this_iteration includes user_skills_id
                skill_similarity_list.push({
                    project_id: allProjectSkills[i].id,
                    project_name: allProjectSkills[i].project_name,
                    skill_id: relevant_skill_list,
                    skill_similarity: 100,
                    type: SimilarityTier.C,
                });
            } else if (one_or_more_match == false) {
                // type D scenario | NO MATCHES
                skill_similarity_list.push({
                    project_id: allProjectSkills[i].id,
                    project_name: allProjectSkills[i].project_name,
                    skill_id: null,
                    skill_similarity: 0,
                    type: SimilarityTier.D,
                });
            } else {
                // Type B scenario | (relevant_skill_list.length/(project_skills_in_this_iteration.length))% MATCHES
                skill_similarity_list.push({
                    project_id: allProjectSkills[i].id,
                    project_name: allProjectSkills[i].project_name,
                    skill_id: relevant_skill_list,
                    skill_similarity: Math.round(
                        (relevant_skill_list.length /
                            project_skills_in_this_iteration.length) *
                            100
                    ),
                    type: SimilarityTier.B,
                });
            }
        }

        console.log(skill_similarity_list);

        if (aggregate_similarity_list.length > 0) {
            setRecommendedProject(aggregate_similarity_list);
        }
    };

    const getData = async () => {
        const memberInfo = await MemberInfo(id);
        setMember(memberInfo);
        const allSkills = await GetAllSkills();
        setAllSkills(allSkills);
        const allInterests = await GetAllInterests();
        setAllInterests(allInterests);
        const allPS = await GetAllProjectSkills();
        setAllProjectSkills(allPS);
        const allPI = await GetAllProjectInterests();
        setAllProjectInterests(allPI);
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
            await RemoveSkillFromMember(id, deleteList);
            await getData();
        }
        if (addList.length != 0) {
            await AddSkillFromMember(id, addList);
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
            await RemoveInterestFromMember(id, deleteList);
            await getData();
        }
        if (addList.length != 0) {
            await AddInterestFromMember(id, addList);
            await getData();
        }
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
                    <Row className="pt-3">
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
                                        <div className="pt-3 pb-3 ps-3">
                                            <h6>
                                                Class of{" "}
                                                {member.graduating_year}
                                            </h6>
                                            <h6>Role: {member.role}</h6>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
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
                                                Recommended Projects
                                            </h4>
                                        </div>
                                        <div className="pt-3 ps-3">
                                            <p>
                                                The projects below are
                                                recommended based on your skills
                                                and interests you have listed.
                                            </p>
                                            <ol>
                                                {recommendedProject.map(
                                                    (obj, key) => {
                                                        return (
                                                            <li key={key}>
                                                                {
                                                                    obj.project_name
                                                                }
                                                            </li>
                                                        );
                                                    }
                                                )}
                                            </ol>
                                            <Button
                                                variant="dark"
                                                onClick={recommenderAlgo}
                                            >
                                                Load Recommendations
                                            </Button>
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
                                                Projects
                                            </h4>
                                        </div>
                                        <div className="pt-3 ps-3">
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
                                                Skills
                                            </h4>
                                        </div>
                                        <div className="pt-3 pb-3 ps-3">
                                            <ul>
                                                {skills.length == 0 ? (
                                                    <li>
                                                        There are no skills
                                                        listed currently.
                                                    </li>
                                                ) : (
                                                    <>
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
                                                    </>
                                                )}
                                            </ul>
                                            <Button
                                                variant="dark"
                                                onClick={handleSkillsShow}
                                            >
                                                Edit Skills
                                            </Button>
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
                                        <div className="pt-3 pb-3 ps-3">
                                            <ul>
                                                {interests.length == 0 ? (
                                                    <li>
                                                        There are no interests
                                                        listed currently.
                                                    </li>
                                                ) : (
                                                    <>
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
                                                    </>
                                                )}
                                            </ul>
                                            <Button
                                                variant="dark"
                                                onClick={handleInterestsShow}
                                            >
                                                Edit Interests
                                            </Button>
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
