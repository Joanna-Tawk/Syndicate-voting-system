import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function CandidateProgram() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [candidate, setCandidate] = useState(null);
  const [electionStatus, setElectionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [program, setProgram] = useState("");

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:5000/api/candidates/${id}`).then(res => res.json()),
      fetch("http://localhost:5000/api/current-election").then(res => res.json())
    ])
      .then(([candidateData, electionData]) => {
        setCandidate(candidateData);
        setProgram(candidateData.program_text || "");
        if (electionData) setElectionStatus(electionData.status);
      })
      .finally(() => setLoading(false));
  }, [id]);

  /* ================= PERMISSIONS ================= */
  const canEdit =
    user?.role === "candidate" &&
    candidate &&
    Number(user?.candidate_id) === Number(candidate.id) &&
    electionStatus === 0;

  const canVote =
    electionStatus === 1 &&
    (user?.role === "voter" || user?.role === "candidate");

  /* ================= VOTE ================= */
  const handleVote = async () => {
    if (!candidate || !user) return;

    try {
      const res = await fetch("http://localhost:5000/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voter_id: user.id,
          candidate_id: candidate.id,
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        navigate("/thank-you");
        return;
      }

      alert(data.message || "Voting failed");
    } catch (err) {
      console.error(err);
      alert("Server error while voting");
    }
  };

  /* ================= SAVE PROGRAM ================= */
  const saveProgram = async () => {
    if (program.trim().length < 50) {
      alert("Program must be at least 50 characters");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/candidates/${candidate.id}/program`,
        {
          user_id: user.id,
          program_text: program,
        }
      );

      if (res.data.status !== "success") {
        alert(res.data.message || "Update failed");
        return;
      }

      setCandidate({ ...candidate, program_text: program });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update program");
    }
  };

  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Loading candidate profile...</h2>;
  }

  return (
    <div className="program-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back to Candidates
      </button>

      <div className="program-card">
        <div className="program-header">
          {candidate.image && (
            <img
              src={candidate.image}
              alt={candidate.name}
              className="program-avatar"
            />
          )}

          <div className="program-header-info">
            <h1 className="program-name">{candidate.name}</h1>
            <span className="program-badge">Official Candidate</span>
          </div>
        </div>

        {user?.role === "voter" && (
          <div className="program-note">
            🗳️ Please review the candidate’s election program carefully before
            submitting your vote.
          </div>
        )}

        {canEdit && (
          <div className="edit-note">
            ✏️ Program editing is allowed only during the registration phase.
          </div>
        )}

        <div className="program-content">
          <h2>Election Program</h2>

          {isEditing ? (
            <textarea
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              rows={8}
            />
          ) : (
            <p>{candidate.program_text}</p>
          )}

          {canEdit && !isEditing && (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              ✏️ Edit Program
            </button>
          )}

          {isEditing && (
            <div className="edit-actions">
              <button className="save-btn" onClick={saveProgram}>
                💾 Save Changes
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setProgram(candidate.program_text);
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {canVote && (
          <div className="program-actions">
            <button className="vote-btn big" onClick={handleVote}>
              Vote 
            </button>
          </div>
        )}
      </div>
    </div>
  );
}