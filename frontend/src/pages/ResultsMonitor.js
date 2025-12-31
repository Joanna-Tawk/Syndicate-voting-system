import React, { useEffect, useState } from "react";

const ResultsMonitor = () => {
  const [summary, setSummary] = useState(null);
  const [results, setResults] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [countdown, setCountdown] = useState(0); // seconds

  /* ===== FETCH DATA ===== */
  const fetchData = () => {
    Promise.all([
      fetch("http://localhost:5000/election-summary").then(r => r.json()),
      fetch("http://localhost:5000/results").then(r => r.json())
    ]).then(([s, r]) => {
      if (s.status === "success") setSummary(s.summary);
      if (r.status === "success") setResults(r.results);
      setLastUpdate(Date.now());
      setCountdown(5); // reset countdown
    });
  };

  /* ===== INITIAL + AUTO REFRESH ===== */
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  /* ===== COUNTDOWN ===== */
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /* ===== ACTIONS ===== */
  const startElection = async () => {
    await fetch("http://localhost:5000/api/election/start", { method: "POST" });
    fetchData();
  };

  const endElection = async () => {
    await fetch("http://localhost:5000/api/election/end", { method: "POST" });
    fetchData();
  };

  const resetElection = async () => {
    if (!window.confirm("Reset election?\nAll votes will be cleared."))
      return;

    await fetch("http://localhost:5000/api/election/reset", { method: "POST" });
    localStorage.removeItem("hasVoted");
    localStorage.removeItem("votedCandidate");
    fetchData();
  };

  if (!summary) return <h2>Loading...</h2>;

  const totalVotes = summary.voters_voted || 0;
  const sortedResults = [...results].sort((a, b) => b.votes - a.votes);
  const leader = sortedResults[0];

  return (
    <div className="monitor-dashboard">
      <h1>Election Monitor Dashboard</h1>

      {/* ===== LIVE STATS ===== */}
      <div className="live-stats">
        <div>
          <span>Total Votes</span>
          <strong>{totalVotes}</strong>
        </div>

        <div>
          <span>Candidates</span>
          <strong>{results.length}</strong>
        </div>

        <div>
          <span>Status</span>
          <strong className="live-dot">
            {summary.status_code === 1 ? "● LIVE" : "—"}
          </strong>
        </div>

        <div>
          <span>Refresh In</span>
          <strong>{countdown}s</strong>
        </div>
      </div>

      {/* ===== STATUS ===== */}
      <p className="status-text">
        Status:{" "}
        <strong>
          {summary.status_code === 0
            ? "Not Started"
            : summary.status_code === 1
            ? "Ongoing"
            : "Finished"}
        </strong>
      </p>

      {/* ===== STATUS 0 ===== */}
      {summary.status_code === 0 && (
        <button className="start-btn" onClick={startElection}>
          Start Election
        </button>
      )}

      {/* ===== STATUS 1 (LIVE) ===== */}
      {summary.status_code === 1 && (
        <>
          <div className="monitor-actions">
            <button className="end-btn" onClick={endElection}>
              End Election
            </button>
            <button className="reset-btn" onClick={resetElection}>
              Reset System
            </button>
          </div>

          {/* ===== LEADER ===== */}
          {leader && (
            <div className="leader-card">
              🏆 {leader.full_name}
              <span>
                {leader.votes} votes •{" "}
                {totalVotes > 0
                  ? ((leader.votes / totalVotes) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
          )}

          {/* ===== LIVE TABLE ===== */}
          <table className="results-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Candidate</th>
                <th>Votes</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((c, i) => {
                const share =
                  totalVotes > 0
                    ? ((c.votes / totalVotes) * 100).toFixed(1)
                    : 0;

                return (
                  <tr key={c.candidate_id}>
                    <td className={`rank rank-${i + 1}`}>{i + 1}</td>
                    <td>{c.full_name}</td>
                    <td>{c.votes}</td>
                    <td>
                      <div className="progress-wrap">
                        <div
                          className="progress-bar"
                          style={{ width: `${share}%` }}
                        />
                        <span>{share}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {/* ===== STATUS 2 (FINAL) ===== */}
      {summary.status_code === 2 && (
        <>
          <h3>Final Election Results</h3>

          <table className="results-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Candidate</th>
                <th>Votes</th>
                <th>Position</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((c, i) => {
                const share =
                  totalVotes > 0
                    ? ((c.votes / totalVotes) * 100).toFixed(1)
                    : 0;

                return (
                  <tr key={c.candidate_id}>
                    <td className={`rank rank-${i + 1}`}>{i + 1}</td>
                    <td>{c.full_name}</td>
                    <td>{c.votes}</td>
                    <td>
                      {i === 0 && "🏆 President"}
                      {i > 0 && i <= 4 && "Council Member"}
                      {i > 4 && "Not Elected"}
                    </td>
                    <td>{share}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <button className="reset-btn" onClick={resetElection}>
            Reset System
          </button>
        </>
      )}
    </div>
  );
};

export default ResultsMonitor;