import React, { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // for error/success messages

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(""); // clear previous message

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("Login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "/dashboard"; // redirect after 1 sec
        }, 1000);
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again later.");
    }
  };

  return (
    <div className="login-page">
      <div id="login-box">
        <img
          src="https://i.pinimg.com/736x/31/5e/09/315e09d46f6c3784ed889938fc7b2d8e.jpg"
          alt="logo"
        />
        <h2>Expense master</h2>
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <a href="/signup">Don't Have an account?</a>
        <br />
        <button onClick={handleLogin}>Log in</button>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
