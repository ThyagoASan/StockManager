import { useState } from "react";
import api from "../services/api";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await api.login(email, password);

      localStorage.setItem("token", data.token);

      onLogin(data.token);
      setMensaje("Inicio de sesión correcto");
    }catch (error) {
  console.error("ERROR LOGIN:", error);
  setMensaje("Error al iniciar sesión");
}
  };

  return (
    <div>
      <h1>StockManager</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit">
          Iniciar sesión
        </button>
      </form>

      <p>{mensaje}</p>
    </div>
  );
}

export default Login;