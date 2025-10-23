import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import AIChat from "./AIChat";

export default function Tracker() {
  const { trackerId } = useParams();
  const [entries, setEntries] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showIncome, setShowIncome] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeDesc, setIncomeDesc] = useState("");
  const [incomeDate, setIncomeDate] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [invalidTracker, setInvalidTracker] = useState(false); // NEW: flag for unauthorized tracker

  // Fetch entries
  const fetchEntries = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/tracker/entries/${trackerId}`, {
        credentials: "include",
      });
      if (res.status === 404) {
        setInvalidTracker(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchEntries(); }, [trackerId]);

  // Add entry
  const addEntry = async (type, desc, amount, date) => {
    if (!amount || !date) return;
    try {
      const res = await fetch("http://localhost:5000/api/tracker/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ trackerId, entryType: type, description: desc, amount, entryDate: date }),
      });
      if (res.ok) fetchEntries();
    } catch (err) { console.error(err); }
  };

  // Delete entry
  const deleteEntry = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tracker/entry/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchEntries();
    } catch (err) { console.error(err); }
  };

  // Chart data
  const chartData = entries.reduce((acc, e) => {
    const dateStr = e.entry_date;
    if (!acc[dateStr]) acc[dateStr] = { date: dateStr, income: 0, expense: 0 };
    if (e.entry_type === "income") acc[dateStr].income += parseFloat(e.amount);
    else acc[dateStr].expense += parseFloat(e.amount);
    return acc;
  }, {});
  const chartArray = Object.values(chartData);

  // NEW: Show full-screen message if tracker is invalid
  if (invalidTracker) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "white",
          fontSize: "2rem",
          fontWeight: "bold",
          color: "black",
        }}
      >
        Nice Try Diddy, make your own data
      </div>
    );
  }

  return (
    <div className="tracker-page">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <button className="toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "←" : "→"}
        </button>

        <div className={`sidebar-content ${sidebarOpen ? "show" : ""}`}>
          <h3>Tracker Actions</h3>

          {/* Income */}
          <button className="retract-btn" onClick={() => setShowIncome(!showIncome)}>Add Income</button>
          <div className={`retractable ${showIncome ? "show" : ""}`}>
            <input placeholder="Description" value={incomeDesc} onChange={(e) => setIncomeDesc(e.target.value)} />
            <input type="number" placeholder="Amount" value={incomeAmount} onChange={(e) => setIncomeAmount(e.target.value)} />
            <input type="date" value={incomeDate} onChange={(e) => setIncomeDate(e.target.value)} />
            <button onClick={() => { addEntry("income", incomeDesc, incomeAmount, incomeDate); setIncomeDesc(""); setIncomeAmount(""); setIncomeDate(""); }}>Save Income</button>
          </div>

          {/* Expense */}
          <button className="retract-btn" onClick={() => setShowExpense(!showExpense)}>Add Expense</button>
          <div className={`retractable ${showExpense ? "show" : ""}`}>
            <input placeholder="Description" value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} />
            <input type="number" placeholder="Amount" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} />
            <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} />
            <button onClick={() => { addEntry("expense", expenseDesc, expenseAmount, expenseDate); setExpenseDesc(""); setExpenseAmount(""); setExpenseDate(""); }}>Save Expense</button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        <title>Tracker Window</title>
        <div className="table-container">
          <h2>Entries</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td>{e.description}</td>
                  <td>{e.amount}</td>
                  <td>{e.entry_type}</td>
                  <td>{e.entry_date}</td>
                  <td><button onClick={() => deleteEntry(e.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="chart-container">
          <h2>Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartArray}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="income" fill="#4caf50" />
              <Bar dataKey="expense" fill="#f44336" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Chat */}
      <AIChat />
    </div>
  );
}
