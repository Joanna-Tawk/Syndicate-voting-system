import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Previous = () => {
  const [years, setYears] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/previous-elections")
      .then((res) => {
        setYears(res.data);
      })
      .catch(() => alert("Failed to load previous elections"));
  }, []);

  return (
    <div className="previous-container">
      {/* ===== Page Header ===== */}
      <div className="previous-header">
        <h1>Previous Elections</h1>
        <p>
          Browse archived election results from previous years.
          Select a year to view detailed voting outcomes.
        </p>
      </div>

      {/* ===== Elections List ===== */}
      <div className="previous-list">
        {years.length === 0 && (
          <div className="empty-state">
            No archived elections available.
          </div>
        )}

        {years.map((year) => (
          <div
            key={year}
            className="previous-card"
            onClick={() => navigate(`/previous/${year}`)}
          >
            <div className="previous-card-left">
              <span className="archive-icon">🗳️</span>
              <div>
                <h3>{year} Election</h3>
                <span className="archive-badge">Archived</span>
              </div>
            </div>

            <div className="previous-card-right">
              <span className="view-link">View Results →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Previous;