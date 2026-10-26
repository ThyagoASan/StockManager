
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Setup from "./pages/Setup";
import "./App.css";

const API_URL = "https://localhost:7228/api";

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [requiereConfiguracion, setRequiereConfiguracion] =
    useState(null);

  const [error, setError] = useState("");

  async function verificarConfiguracion() {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/setup/estado`
      );

      if (!response.ok) {
        throw new Error(
          "No se pudo consultar la configuración."
        );
      }

      const data = await response.json();

      setRequiereConfiguracion(
        data.requiereConfiguracion
      );
    } catch {
      setError(
        "No se pudo conectar con StockManager. Verificá que el backend esté iniciado."
      );
    }
  }

  useEffect(() => {
    verificarConfiguracion();
  }, []);

  if (error) {
    return (
      <main style={{ padding: "30px" }}>
        <h2>Error de conexión</h2>
        <p>{error}</p>
        <button onClick={verificarConfiguracion}>
          Reintentar
        </button>
      </main>
    );
  }

  if (requiereConfiguracion === null) {
    return <p>Verificando StockManager...</p>;
  }

  if (requiereConfiguracion) {
    return (
      <Setup
        onSetupComplete={() => {
          setRequiereConfiguracion(false);
        }}
      />
    );
  }

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return <Dashboard />;
}

export default App;
