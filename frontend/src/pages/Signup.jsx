import React, { useState, useEffect } from "react";
import { API_URL } from "./config";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // for error/success messages
  const [numLockOn, setNumLockOn] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.code.startsWith("Numpad") &&
        !e.getModifierState("NumLock")
      ) {
        setNumLockOn(false);
      } else {
        setNumLockOn(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage(""); // clear previous message

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, dob, username, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("Signup successful! You can now log in.");
        setTimeout(() => {
          window.location.href = "/login"; // redirect after 1 sec
        }, 1000);
      } else {
        setMessage(data.message || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again later.");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-box">
        <h2>Sign up</h2>
        <label>Name: </label>
        <input
          type="text"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <br />
        <label>Date of Birth: </label>
        <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
        <br />
        <label>Username: </label>
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <label>Password: </label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {!numLockOn && (
          <p style={{ color: "red" }}>
            Num Lock is off! Numpad keys won’t work correctly.
          </p>
        )}
        <p>
          Already have an account? <a href="/login">Log in</a>
        </p>
        <button onClick={handleSignup}>Sign in</button>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}