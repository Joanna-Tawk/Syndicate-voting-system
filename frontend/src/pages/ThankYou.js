import React from "react";
import { useNavigate } from "react-router-dom";

const ThankYou = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="thankyou-page">
      <div className="thankyou-card">
        {/* Icon */}
        <div className="thankyou-icon">✅</div>

        <h1 className="thankyou-title">Vote Submitted Successfully</h1>

        <p className="thankyou-text">
          Thank you{user ? `, ${user.full_name}` : ""}, for participating in the
          election. Your vote has been securely recorded and cannot be modified.
        </p>

        <div className="thankyou-info">
          🛡️ This voting system ensures transparency, integrity, and voter
          confidentiality.
        </div>

        <div className="thankyou-actions">
          <button className="primary-btn" onClick={() => navigate("/")}>
            Back to Home
          </button>

          <button
            className="secondary-btn"
            onClick={() => navigate("/results")}
          >
            View Election Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;