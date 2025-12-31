import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import previousImg from "../assets/Previous.png";
import currentImg from "../assets/current.png";
import resultsImg from "../assets/results.png";

const Home = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/election-summary")
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          setSummary(data.summary);
        }
      });
  }, []);

  const getStatusLabel = (status) => {
    if (status === 0) return "Not Started";
    if (status === 1) return "Ongoing";
    return "Finished";
  };

  const getStatusIcon = (status) => {
    if (status === 0) return "🟡";
    if (status === 1) return "🟢";
    return "🔴";
  };

  return (
    <div className="home-container">
      {/* ===== Title ===== */}
      <h1 className="home-title">
        Welcome to the Syndicate Voting System
      </h1>

      <p className="home-subtitle">
        A secure, transparent, and role-based electronic voting platform
        designed for syndicate elections.
      </p>

      {/* ===== User Context ===== */}
      {user && (
        <p className="home-user">
          Logged in as <strong>{user.full_name}</strong> {user.role}
        </p>
      )}

      {/* ===== Status Bar ===== */}
      {summary && (
        <div className="status-bar">
          <span className="status-icon">
            {getStatusIcon(summary.status_code)}
          </span>
          <span className="status-text">
            Election Status: <strong>{getStatusLabel(summary.status_code)}</strong>
          </span>
        </div>
      )}

      {/* ===== Mini Summary ===== */}
      {summary && (
        <div className="summary-grid">
          <div className="summary-card">
            <h4>Total Voters</h4>
            <p>{summary.total_voters}</p>
          </div>

          <div className="summary-card">
            <h4>Votes Cast</h4>
            <p>{summary.voters_voted}</p>
          </div>

          <div className="summary-card">
            <h4>Turnout</h4>
            <p>{summary.turnout_percent}%</p>
          </div>
        </div>
      )}

      {/* ===== Main Navigation Cards ===== */}
      <div className="home-grid">

        <div className="home-card" onClick={() => navigate("/previous")}>
          <img src={previousImg} alt="Previous Elections" />
          <h3>Previous Elections</h3>
          <p>View statistics and results of past elections.</p>
        </div>

        <div className="home-card" onClick={() => navigate("/current-election")}>
          <img src={currentImg} alt="Current Election" />
          <h3>Current Election</h3>
          <p>Participate in the ongoing election.</p>
        </div>

        <div className="home-card" onClick={() => navigate("/results")}>
          <img src={resultsImg} alt="Election Results" />
          <h3>Election Results</h3>
          <p>View live and final election results.</p>
        </div>

      </div>

      {/* ===== Footer ===== */}
      <div className="home-footer">
        © 2025 Syndicate Online Voting System · Academic Project
      </div>
    </div>
  );
};

export default Home;