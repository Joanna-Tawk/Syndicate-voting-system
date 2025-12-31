import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignIn = ({ onLogin }) => {
  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/login", {
        national_id: nationalId,
        password: password
      });

      if (res.data.status === "success") {
        const user = res.data.user;

        localStorage.setItem("user", JSON.stringify(user));
        onLogin(user);

        // توجيه حسب الدور
        if (user.role === "voter") navigate("/");
        else if (user.role === "candidate") navigate("/");
        else if (user.role === "monitor") navigate("/monitor");
        else navigate("/");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign In</h2>

        <form onSubmit={handleSubmit}>
          <label> ID</label>
          <input
            type="text"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;