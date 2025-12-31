import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CurrentElection() {
  const [candidates, setCandidates] = useState([]);
  const [electionStatus, setElectionStatus] = useState(null);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const hasVoted = localStorage.getItem("hasVoted") === "true";

  /* ================= FETCH CANDIDATES ================= */
  const fetchCandidates = () => {
    fetch("http://localhost:5000/api/current-election/candidates")
      .then((res) => res.json())
      .then((data) => setCandidates(data))
      .catch(() => setCandidates([]));
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchCandidates();
  }, []);

  /* ================= AUTO REFRESH (IMPORTANT) ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCandidates();
    }, 3000); // كل 3 ثواني

    return () => clearInterval(interval);
  }, []);

  /* ================= FETCH ELECTION STATUS ================= */
  useEffect(() => {
    fetch("http://localhost:5000/api/current-election")
      .then((res) => res.json())
      .then((data) => {
        if (data) setElectionStatus(data.status);
      });
  }, []);

  /* ================= VOTING RULE ================= */
  const canVote =
    electionStatus === 1 &&
    (user?.role === "voter" || user?.role === "candidate") &&
    !hasVoted;

  /* ================= HANDLE VOTE ================= */
  const handleVote = async (candidateId) => {
    try {
      const res = await fetch("http://localhost:5000/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voter_id: user.id,
          candidate_id: candidateId,
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        localStorage.setItem("hasVoted", "true");
        navigate("/thank-you");
        return;
      }

      alert(data.message || "Voting failed");
    } catch (error) {
      console.error(error);
      alert("Server error while voting");
    }
  };

  return (
    <div className="current-container">
      <div className="current-header">
        <h1>Current Election</h1>
      </div>

      <div className="candidates-grid">
        {candidates.length === 0 ? (
          <p className="empty-text">No candidates available</p>
        ) : (
          candidates.map((c) => (
            <div key={c.id} className="candidate-card">
              <img
                src={c.image || "https://via.placeholder.com/150"}
                alt={c.name}
                className="candidate-image"
              />

              <h3 className="candidate-name">{c.name}</h3>

              <div className="candidate-actions">
                <button
                  className="secondary-btn"
                  onClick={() => navigate(`/candidate/${c.id}`)}
                >
                  View Program
                </button>

                {canVote ? (
                  <button
                    className="vote-btn"
                    onClick={() => handleVote(c.id)}
                  >
                    Vote
                  </button>
                ) : (
                  <span className="vote-disabled">
                    Voting not available
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}