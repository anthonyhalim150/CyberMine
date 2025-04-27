import React, { useState } from "react";
import { loginUser } from "../api/user";
import "../styles/components/Login.css";

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await loginUser(username, password);
      if (response.success) {
        setUser({
          id: response.userID, 
          username: response.username, 
          role: response.role, 
        });
      } else {
        setError(response.message || "Login failed.");
      }
    } catch (err) {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <p className="signup-link">
          No account yet? <a href="https://cybermall.netlify.app/signup" target="_blank" rel="noopener noreferrer">Sign up here</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
