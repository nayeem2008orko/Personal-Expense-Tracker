import React, { useState, useEffect } from "react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // for error/success messages
  const [numLockOn, setNumLockOn] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only check for numpad keys
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(""); // clear previous message

    try {
      const res = await fetch("/api/auth/login", {
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
        {!numLockOn && (
          <p style={{ color: "red" }}>
            Num Lock is off! Numpad keys won’t work correctly.
          </p>
        )}
        <a href="/signup">Don't Have an account?</a>
        <br />
        <button onClick={handleLogin}>Log in</button>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}