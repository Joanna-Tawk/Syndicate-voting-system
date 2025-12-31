import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CandidateSubmission = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [program, setProgram] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [election, setElection] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     PAGE PROTECTION
  ========================= */
  useEffect(() => {
    if (!user || user.role !== "voter") {
      navigate("/");
      return;
    }

    fetch("http://localhost:5000/api/current-election")
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.status !== 0) {
          navigate("/");
        } else {
          setElection(data);
        }
      })
      .catch(() => navigate("/"));
  }, [user, navigate]);

  /* =========================
     IMAGE PREVIEW
  ========================= */
  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async () => {
    setError("");

    if (!image) {
      setError("Please upload your personal photo.");
      return;
    }

    if (program.trim().length < 50) {
      setError("Your election program must be at least 50 characters.");
      return;
    }

    if (!election?.id) {
      setError("No active election found.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("election_id", election.id); // ✅ FIX
      formData.append("program_text", program);
      formData.append("full_name", user.full_name);
      formData.append("image", image);

      await axios.post(
        "http://localhost:5000/api/candidates/submit",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // ✅ update role locally
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, role: "candidate" })
      );

      navigate("/current-election");
    } catch (err) {
      console.error(err);
      setError("Submission failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="candidate-page">
      <div className="candidate-card">
        <h1 className="candidate-title">Candidate Application</h1>

        <p className="candidate-subtitle">
          Submit your official candidacy for the current election.
        </p>

        <div className="candidate-info-box">
          <p><strong>Applicant:</strong> {user?.full_name}</p>
          <p><strong>Election Status:</strong> Registration Phase</p>
        </div>

        {/* 📸 Photo */}
        <div className="candidate-group">
          <label>Candidate Photo</label>
          <input
            type="file"
            accept="image/png, image/jpeg"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <small className="hint">JPG or PNG – Max 3MB</small>

          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" />
            </div>
          )}
        </div>

        {/* 📝 Program */}
        <div className="candidate-group">
          <label>Election Program</label>
          <textarea
            placeholder="Describe your goals, vision, and priorities for the syndicate..."
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            rows={8}
          />
          <small className="hint">
            {program.length} / 50 characters minimum
          </small>
        </div>

        {error && <div className="candidate-error">{error}</div>}

        <p className="candidate-note">
          ⚠️ Once submitted, your application cannot be edited.
        </p>

        <button
          className="candidate-submit-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </div>
  );
};

export default CandidateSubmission;