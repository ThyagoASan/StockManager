import { useState } from "react";
import api from "../services/api";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      const response = await api.login(email, password);

      localStorage.setItem("token", response.token);
      onLogin(response.token);

    } catch (error) {
      console.error(error);
      setMensaje("Email o contraseña incorrectos");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <h1>StockManager</h1>

        <p className="login-subtitle">
          Sistema de gestión de inventario
        </p>

        <form onSubmit={iniciarSesion}>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@stockmanager.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button"
          >
            Iniciar sesión
          </button>

        </form>

        {mensaje && (
          <p className="login-message">
            {mensaje}
          </p>
        )}

      </div>
    </div>
  );
}

export default Login;