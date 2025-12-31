import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const PreviousYearResults = () => {
  const { year } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/previous-elections/${year}`)
      .then((res) => setResults(res.data))
      .catch(() => alert("Failed to load results"))
      .finally(() => setLoading(false));
  }, [year]);

  if (loading) {
    return (
      <div className="previous-container">
        <div className="loading-state">Loading election results…</div>
      </div>
    );
  }

  const totalVotes = results.reduce(
    (sum, r) => sum + Number(r.votes_received),
    0
  );

  const winners = results.filter((r) => r.result === "Won").length;

  /* ===== SORT + ENHANCE RESULTS ===== */
  const enhancedResults = [...results]
    .sort((a, b) => b.votes_received - a.votes_received)
    .map((r, index) => {
      const share = totalVotes
        ? ((r.votes_received / totalVotes) * 100).toFixed(1)
        : 0;

      let position = "Not Elected";
      if (r.result === "Won") {
        position = index === 0 ? "President" : "Council Member";
      }

      return {
        ...r,
        rank: index + 1,
        share,
        position,
      };
    });

  return (
    <div className="previous-container">
      {/* Back */}
      <button className="back-btn" onClick={() => navigate("/previous")}>
        ← Back to Previous Elections
      </button>

      {/* Header */}
      <div className="year-header">
        <h1>Election Results – {year}</h1>
        <p>
          Official archived results of the syndicate election held in {year}.
        </p>
      </div>

      {/* Summary */}
      <div className="year-summary">
        <div className="summary-box">
          <span>Total Candidates</span>
          <strong>{results.length}</strong>
        </div>
        <div className="summary-box">
          <span>Total Votes</span>
          <strong>{totalVotes}</strong>
        </div>
        <div className="summary-box">
          <span>Elected Candidates</span>
          <strong>{winners}</strong>
        </div>
      </div>

      {/* Results Table */}
      <div className="table-card">
        <table className="results-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Candidate</th>
              <th>Votes</th>
              <th>Position</th>
              <th>Share</th>
              <th>Result</th>
            </tr>
          </thead>

          <tbody>
            {enhancedResults.map((r) => (
              <tr key={r.candidate_id}>
                <td className="rank-cell">{r.rank}</td>
                <td className="candidate-cell">{r.candidate_name}</td>
                <td>{r.votes_received}</td>

                <td>
                  <span
                    className={`position-badge ${
                      r.position === "President"
                        ? "president"
                        : r.position === "Council Member"
                        ? "council"
                        : "none"
                    }`}
                  >
                    {r.position}
                  </span>
                </td>

                <td>{r.share}%</td>

                <td>
                  <span
                    className={`result-badge ${
                      r.result === "Won" ? "won" : "lost"
                    }`}
                  >
                    {r.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="archive-note">
        These results are final and archived for public reference.
      </div>
    </div>
  );
};

export default PreviousYearResults;