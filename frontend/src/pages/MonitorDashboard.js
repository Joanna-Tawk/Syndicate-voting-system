import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MonitorDashboard() {
  const [users, setUsers] = useState([]);
  const [electionStatus, setElectionStatus] = useState(null);
  const [search, setSearch] = useState("");

  /* ================= LOAD USERS ================= */
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/users")
      .then((res) => setUsers(res.data))
      .catch(() => setUsers([]));
  }, []);

  /* ================= LOAD ELECTION STATUS ================= */
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/current-election")
      .then((res) => {
        if (res.data) setElectionStatus(res.data.status);
      })
      .catch(() => setElectionStatus(null));
  }, []);

  /* ================= ROLE RULES ================= */
  const getAllowedRoles = (currentRole) => {
    switch (currentRole) {
      case "monitor":
        return ["monitor", "voter"];
      case "voter":
        return ["voter", "monitor"];
      case "candidate":
        return ["candidate", "voter"];
      default:
        return [currentRole];
    }
  };

  /* ================= UPDATE ROLE ================= */
  const updateRole = (userId, currentRole, newRole) => {
    if (electionStatus !== 0) {
      alert("❌ Role changes are locked after election starts");
      return;
    }

    const allowed = getAllowedRoles(currentRole);
    if (!allowed.includes(newRole)) {
      alert("❌ This role change is not allowed");
      return;
    }

    axios
      .put(`http://localhost:5000/api/users/${userId}/role`, {
        role: newRole,
      })
      .then(() => {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, role: newRole } : u
          )
        );
      })
      .catch(() => alert("❌ Failed to update role"));
  };

  /* ================= FILTER & SORT ================= */
  const filteredUsers = users
    .filter((u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const order = { monitor: 0, candidate: 1, voter: 2 };
      return order[a.role] - order[b.role];
    });

  return (
    <div className="monitor-dashboard">
      <h1>System Administration</h1>
      <p>User & Role Management Panel</p>

      {/* ===== STATUS ===== */}
      <div className="status-box">
        <strong>Election Status:</strong>{" "}
        {electionStatus === 0
          ? "Registration Phase"
          : electionStatus === 1
          ? "Voting In Progress"
          : "Election Finished"}

        {electionStatus !== 0 && (
          <div className="locked-text">
            ❌ Role changes are disabled
          </div>
        )}
      </div>

      {/* ===== STATS ===== */}
      <div className="stats">
        <span>
          Voters: {users.filter((u) => u.role === "voter").length}
        </span>
        <span>
          Candidates:{" "}
          {users.filter((u) => u.role === "candidate").length}
        </span>
        <span>
          Monitors: {users.filter((u) => u.role === "monitor").length}
        </span>
      </div>

      {/* ===== SEARCH ===== */}
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ===== USERS TABLE ===== */}
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Current Role</th>
            <th>Change Role</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.full_name}</td>
              <td>{u.role}</td>
              <td>
                <select
                  value={u.role}
                  disabled={electionStatus !== 0}
                  onChange={(e) =>
                    updateRole(u.id, u.role, e.target.value)
                  }
                >
                  {getAllowedRoles(u.role).map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}