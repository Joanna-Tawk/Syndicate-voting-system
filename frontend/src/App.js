import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import axios from "axios";

import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import CurrentElection from "./pages/CurrentElection";
import CandidateSubmission from "./pages/CandidateSubmission";
import CandidateProgram from "./pages/CandidateProgram";
import ElectionLaws from "./pages/ElectionLaws";
import Previous from "./pages/Previous";
import PreviousYearResults from "./pages/PreviousYearResults";
import ResultsVoter from "./pages/ResultsVoter";
import ResultsCandidate from "./pages/ResultsCandidate";
import ResultsMonitor from "./pages/ResultsMonitor";
import ThankYou from "./pages/ThankYou";
import MonitorDashboard from "./pages/MonitorDashboard";

import "./App.css";

const ProtectedRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/signin" replace />;
  return children;
};

const App = () => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD ELECTION DATA ================= */
  useEffect(() => {
    // 1️⃣ current election status
    fetch("http://localhost:5000/api/current-election")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          localStorage.setItem("electionStatus", data.status);
        }
      })
      .catch((err) =>
        console.error("Election status fetch error:", err)
      );

    // 2️⃣ election summary
    axios
      .get("http://localhost:5000/election-summary")
      .then((res) => {
        if (res.data.status === "success") {
          setElection(res.data.summary);
          localStorage.setItem(
            "election",
            JSON.stringify(res.data.summary)
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* ================= AUTH ================= */
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setElection(null);
    localStorage.clear();
  };

  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Loading system...</h2>;
  }

  return (
    <Router>
      {user && (
        <NavBar
          user={user}
          election={election}
          onLogout={handleLogout}
        />
      )}

      <Routes>
        {/* AUTH */}
        <Route
          path="/signin"
          element={<SignIn onLogin={handleLogin} />}
        />

        {/* HOME */}
        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* CURRENT ELECTION */}
        <Route
          path="/current-election"
          element={
            <ProtectedRoute user={user}>
              <CurrentElection />
            </ProtectedRoute>
          }
        />

        {/* CANDIDATE SUBMISSION */}
        <Route
          path="/candidate-submission"
          element={
            <ProtectedRoute user={user}>
              <CandidateSubmission />
            </ProtectedRoute>
          }
        />

        {/* CANDIDATE PROGRAM */}
        <Route
          path="/candidate/:id"
          element={
            <ProtectedRoute user={user}>
              <CandidateProgram />
            </ProtectedRoute>
          }
        />

        {/* ELECTION LAWS */}
        <Route
          path="/election-laws"
          element={
            <ProtectedRoute user={user}>
              <ElectionLaws />
            </ProtectedRoute>
          }
        />

        {/* PREVIOUS */}
        <Route
          path="/previous"
          element={
            <ProtectedRoute user={user}>
              <Previous />
            </ProtectedRoute>
          }
        />

        <Route
          path="/previous/:year"
          element={
            <ProtectedRoute user={user}>
              <PreviousYearResults />
            </ProtectedRoute>
          }
        />

        {/* RESULTS */}
        <Route
          path="/results"
          element={
            <ProtectedRoute user={user}>
              {user?.role === "voter" && (
                <ResultsVoter user={user} election={election} />
              )}
              {user?.role === "candidate" && (
                <ResultsCandidate user={user} election={election} />
              )}
              {user?.role === "monitor" && (
                <ResultsMonitor election={election} />
              )}
            </ProtectedRoute>
          }
        />

        {/* THANK YOU */}
        <Route
          path="/thank-you"
          element={
            <ProtectedRoute user={user}>
              <ThankYou />
            </ProtectedRoute>
          }
        />

        {/* MONITOR DASHBOARD */}
        <Route
          path="/monitor-dashboard"
          element={
            <ProtectedRoute user={user}>
              <MonitorDashboard />
            </ProtectedRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;