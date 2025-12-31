import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Create root
const root = ReactDOM.createRoot(document.getElementById("root"));

// Render application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);