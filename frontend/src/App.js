import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Profile from "./routes/profile/profile";
import Projects from "./routes/projects/projects";
import Dashboard from "./routes/dashboard/dashboard";
import Login from "./components/login/login";
import useToken from "./components/app/useToken";
import NavBar from "./components/navbar/navbar";

export default function App() {
    const { token, setToken } = useToken();

    if (token != true) {
        return <Login setToken={setToken} />;
    }
    return (
        <>
            <NavBar setToken={setToken} />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route
                        path="/profile"
                        element={<Profile value={"VALUE STATED IN INDEX.JS"} />}
                    />
                    <Route path="/projects/:id" element={<Projects />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}
