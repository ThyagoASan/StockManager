import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return <Dashboard />;
}

export default App;