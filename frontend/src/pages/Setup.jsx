
import { useState } from "react";

const API_URL = "https://localhost:7228/api";

export default function Setup({ onSetupComplete }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] =
    useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function crearAdministrador(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 12) {
      setError(
        "La contraseña debe tener al menos 12 caracteres."
      );
      return;
    }

    setCargando(true);

    try {
      const response = await fetch(
        `${API_URL}/setup/admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(
            "Ya existe un administrador. Recargá la página para iniciar sesión."
          );
        }

        throw new Error(
          "No se pudo crear el administrador."
        );
      }

      onSetupComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="setup-container">
      <div className="setup-card">
        <h1>StockManager</h1>
        <h2>Configuración inicial</h2>

        <p>
          Bienvenido. Creá tu cuenta de administrador
          para comenzar a gestionar tu inventario.
        </p>

        <form onSubmit={crearAdministrador}>
          <label>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              minLength={12}
              required
            />
          </label>

          <label>
            Confirmar contraseña
            <input
              type="password"
              value={confirmarPassword}
              onChange={(e) =>
                setConfirmarPassword(e.target.value)
              }
              required
            />
          </label>

          {error && <p role="alert">{error}</p>}

          <button type="submit" disabled={cargando}>
            {cargando
              ? "Creando administrador..."
              : "Crear administrador"}
          </button>
        </form>
      </div>
    </div>
  );
}
