import React from "react";
import { Link, useNavigate } from "react-router-dom";

const NavBar = ({ user, onLogout }) => {
  const electionStatus = Number(localStorage.getItem("electionStatus"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("election");
    onLogout();
    navigate("/signin");
  };

  const getRoleIcon = (role) => {
    if (role === "voter") return "🗳️";
    if (role === "candidate") return "👤";
    if (role === "monitor") return "📊";
    return "👤";
  };

  return (
    <nav className="navbar">
      {/* ===== Left ===== */}
      <div className="navbar-brand">
        <div className="project-title">
          Syndicate Online Voting System
        </div>

        {user && (
          <div className="user-info">
            <div className="user-name">{user.full_name}</div>
            <div className="user-role-text">
              <span className="role-icon">{getRoleIcon(user.role)}</span>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Access
            </div>
          </div>
        )}
      </div>

      {/* ===== Right ===== */}
      <ul className="navbar-links">
        <li>
          <Link to="/">Home</Link>
        </li>

        <li>
          <Link to="/election-laws">Election Laws</Link>
        </li>

        {/* ✅ Candidate Submission
            - voter فقط
            - status = 0 فقط */}
        {user?.role === "voter" && electionStatus === 0 && (
          <li>
            <Link to="/candidate-submission">
              Candidate Submission
            </Link>
          </li>
        )}

        {/* ✅ Monitor Dashboard
            - monitor فقط */}
        {user?.role === "monitor" && (
          <li>
            <Link to="/monitor-dashboard" className="monitor-link">
             Control center
            </Link>
          </li>
        )}

        <li>
          <button onClick={handleLogout} className="link-button">
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;