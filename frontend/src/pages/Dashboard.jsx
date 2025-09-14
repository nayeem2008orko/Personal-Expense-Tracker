import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [trackers, setTrackers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const fetchTrackers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/tracker/list", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setTrackers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (showLoad) fetchTrackers();
  }, [showLoad]);

  const handleCreate = async () => {
    if (!newName) return setMessage("Please enter a name");
    try {
      const res = await fetch("http://localhost:5000/api/tracker/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/tracker/${data.id}`); // redirect to tracker with ID
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (trackerId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tracker/delete/${trackerId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        fetchTrackers();
      } else {
        const data = await res.json();
        setMessage(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = (trackerId) => {
    navigate(`/tracker/${trackerId}`);
  };

  const handleLogout = () => {
    document.cookie = "token=; Max-Age=0; path=/;";
    window.location.href = "/login";
  };

  return (
    <div className="dashboard">
      <div className="banner">
        <img src="https://i.pinimg.com/originals/f7/70/52/f77052ece2019de9570ef039f6b14a49.gif" alt="banner" />
      </div>
      <h1>WELCOME TO EXPENSE MASTERS</h1>
      <h3>Dashboard</h3>

      <div className="dashbox">
        <button id="create" onClick={() => setShowCreate(!showCreate)}>Create a new Expense tracker</button>
        <div className={`retractable ${showCreate ? "show" : ""}`}>
          <input
            type="text"
            placeholder="Enter tracker name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button onClick={handleCreate}>Save</button>
          {message && <p>{message}</p>}
        </div>

        <button id="load" onClick={() => setShowLoad(!showLoad)}>Load an Existing one</button>
        <div className={`retractable ${showLoad ? "show" : ""}`}>
          {trackers.length > 0 ? (
            trackers.map((t) => (
              <div key={t.id} className="tracker-item">
                <span>{t.name}</span>
                <button onClick={() => handleOpen(t.id)}>Open</button>
                <button onClick={() => handleDelete(t.id)}>Delete</button>
              </div>
            ))
          ) : (
            <p>No trackers found</p>
          )}
        </div>

        <button id="log" onClick={handleLogout}>Log out</button>
      </div>

      <footer className="dashfooter">
        <address>
          Created and developed by Nayeem Ahmed <br />
          Github profile: <a href="https://github.com/nayeem2008orko" target="_blank" rel="noreferrer">nayeem2008orko</a>
        </address>
      </footer>
    </div>
  );
}
