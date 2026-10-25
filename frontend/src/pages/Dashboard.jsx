import { useEffect, useState } from "react";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5009/api";
const initial = { nombre: "", descripcion: "", precio: 0, stock: 0, stockMinimo: 5, categoriaId: "", moneda: "ARS" };

export default function Dashboard() {
  const [seccion, setSeccion] = useState("Dashboard");
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [form, setForm] = useState(initial);
  const [editId, setEditId] = useState(null);
  const [categoriaNombre, setCategoriaNombre] = useState("");
  const [categoriaEditId, setCategoriaEditId] = useState(null);
  const [mov, setMov] = useState({ productoId: "", tipo: "entrada", cantidad: 1, motivo: "" });
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function request(path, options = {}) {
    const response = await fetch(BASE + path, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + localStorage.getItem("token"), ...options.headers }
    });
    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.reload();
      throw new Error("Sesión vencida");
    }
    if (!response.ok) {
      const raw = await response.text();
      let detail;
      try { detail = JSON.parse(raw); } catch { detail = raw; }
      const mensajeServidor = typeof detail === "string" ? detail : detail?.mensaje || detail?.detail || detail?.title;
      const mensaje = response.status === 409 && path.startsWith("/Productos/") && options.method === "DELETE"
        ? "No se puede eliminar el producto porque tiene movimientos de stock registrados."
        : response.status === 409 && path === "/Movimientos"
          ? "Stock insuficiente. No hay unidades disponibles para completar esta salida."
          : mensajeServidor || "Error HTTP " + response.status;
      throw new Error(mensaje);
    }
    return response.status === 204 ? null : response.json();
  }

  async function cargar() {
    setCargando(true);
    try {
      const [p, c, m] = await Promise.all([request("/Productos"), request("/Categorias"), request("/Movimientos")]);
      setProductos(p); setCategorias(c); setMovimientos(m); setError("");
    } catch (e) { setError(e.message); }
    finally { setCargando(false); }
  }
  useEffect(() => { cargar(); }, []);

  async function ejecutar(accion, texto) {
    setError(""); setMensaje("");
    try { await accion(); setMensaje(texto); await cargar(); }
    catch (e) { setError(e.message); }
  }

  function guardarProducto(e) {
    e.preventDefault();
    const dto = { ...form, precio: Number(form.precio), stock: Number(form.stock), stockMinimo: Number(form.stockMinimo), categoriaId: Number(form.categoriaId) };
    ejecutar(async () => {
      await request(editId ? "/Productos/" + editId : "/Productos", { method: editId ? "PUT" : "POST", body: JSON.stringify(dto) });
      setEditId(null); setForm(initial);
    }, "Producto guardado.");
  }

  function guardarCategoria(e) {
    e.preventDefault();
    ejecutar(async () => {
      await request(categoriaEditId ? "/Categorias/" + categoriaEditId : "/Categorias", { method: categoriaEditId ? "PUT" : "POST", body: JSON.stringify({ nombre: categoriaNombre }) });
      setCategoriaEditId(null); setCategoriaNombre("");
    }, "Categoría guardada.");
  }

  function registrarMovimiento(e) {
    e.preventDefault();
    ejecutar(async () => {
      await request("/Movimientos", { method: "POST", body: JSON.stringify({ ...mov, productoId: Number(mov.productoId), cantidad: Number(mov.cantidad) }) });
      setMov({ productoId: "", tipo: "entrada", cantidad: 1, motivo: "" });
    }, "Movimiento registrado.");
  }

  const campo = (nombre, label, tipo = "text", extra = {}) => (
    <label className="form-group" key={nombre}>{label}
      <input type={tipo} value={form[nombre]} onChange={e => setForm({ ...form, [nombre]: e.target.value })} required={nombre !== "descripcion"} min={tipo === "number" ? 0 : undefined} {...extra} />
    </label>
  );
  const dinero = (valor, moneda = "ARS") => Number(valor).toLocaleString("es-AR", { style: "currency", currency: moneda === "USD" ? "USD" : "ARS" });

  return <div className="dashboard">
    <aside className="sidebar">
      <h2 className="brand"><span className="brand-mark">S</span> StockManager</h2><p className="sidebar-caption">CONTROL DE INVENTARIO</p>
      {["Dashboard", "Productos", "Categorías", "Movimientos"].map(s =>
        <button type="button" key={s} className={"sidebar-item " + (seccion === s ? "active" : "")} onClick={() => { setSeccion(s); setError(""); setMensaje(""); }}>{s}</button>
      )}
    </aside>
    <main className="main-content">
      <header className="topbar"><div><h1>{seccion}</h1><p>Gestión de inventario</p></div>
        <button className="logout-button" onClick={() => { localStorage.removeItem("token"); window.location.reload(); }}>Cerrar sesión</button>
      </header>
      {error && <p role="alert" className="notice error">{error}</p>}
      {mensaje && <p role="status" className="notice">{mensaje}</p>}
      {cargando && <p>Cargando información...</p>}
      {seccion === "Dashboard" && <section className="stats">
        <div className="stat-card"><h3>📦 Productos</h3><strong>{productos.length}</strong></div>
        <div className="stat-card"><h3>⚠️ Stock bajo</h3><strong>{productos.filter(p => p.stock > 0 && p.stock <= p.stockMinimo).length}</strong></div>
        <div className="stat-card"><h3>🚫 Sin stock</h3><strong>{productos.filter(p => p.stock === 0).length}</strong></div>
        <div className="stat-card"><h3>🗂️ Categorías</h3><strong>{categorias.length}</strong></div>
        <div className="stat-card"><h3>↔️ Movimientos</h3><strong>{movimientos.length}</strong></div>
      </section>}
      {seccion === "Dashboard" && <section className="table-card dashboard-activity">
        <div className="section-heading"><div><h2>Actividad reciente</h2><p>Últimas entradas y salidas registradas</p></div><button className="secondary-button" onClick={() => setSeccion("Movimientos")}>Ver movimientos</button></div>
        {movimientos.length === 0 ? <p className="empty-state">Todavía no hay movimientos de inventario.</p> :
          <div className="activity-list">{movimientos.slice(0, 5).map(m => <div className="activity-item" key={m.id}>
            <span className={"activity-symbol " + (m.tipo === "entrada" ? "incoming" : "outgoing")}>{m.tipo === "entrada" ? "+" : "−"}</span>
            <div className="activity-info"><strong>{productos.find(p => p.id === m.productoId)?.nombre || "Producto #" + m.productoId}</strong><small>{m.motivo || (m.tipo === "entrada" ? "Entrada de stock" : "Salida de stock")} · {new Date(m.fecha).toLocaleString("es-AR")}</small></div>
            <strong className={m.tipo === "entrada" ? "incoming-text" : "outgoing-text"}>{m.tipo === "entrada" ? "+" : "−"}{m.cantidad} uds.</strong>
          </div>)}</div>}
      </section>}
      {seccion === "Productos" && <section className="table-card">
        <h2>{editId ? "Editar producto" : "Nuevo producto"}</h2>
        <form className="product-form" onSubmit={guardarProducto}>
          <div className="form-row">
            {campo("nombre", "Nombre", "text", { maxLength: 150 })}
            {campo("descripcion", "Descripción", "text", { maxLength: 255 })}
            {campo("precio", "Precio", "number", { step: "0.01" })}
            <label className="form-group">Moneda<select value={form.moneda || "ARS"} onChange={e => setForm({ ...form, moneda: e.target.value })}><option value="ARS">ARS — Pesos argentinos</option><option value="USD">USD — Dólares estadounidenses</option></select></label>
            {!editId && campo("stock", "Stock inicial", "number", { step: "1" })}
            {campo("stockMinimo", "Stock mínimo", "number", { step: "1" })}
            <label className="form-group">Categoría
              <select required value={form.categoriaId} onChange={e => setForm({ ...form, categoriaId: e.target.value })}>
                <option value="">Seleccionar</option>{categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </label>
          </div>
          <div className="form-actions"><button className="primary-button" type="submit">Guardar</button>
            {editId && <button type="button" className="cancel-button" onClick={() => { setEditId(null); setForm(initial); }}>Cancelar</button>}
          </div>
        </form>
        <h2>Listado de productos</h2>
        <div className="table-scroll"><table className="products-table"><thead><tr><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Mínimo</th><th>Acciones</th></tr></thead>
          <tbody>{productos.map(p => <tr key={p.id}><td>{p.nombre}</td><td>{categorias.find(c => c.id === p.categoriaId)?.nombre || p.categoriaId}</td><td>{dinero(p.precio, p.moneda)}</td><td className={p.stock <= p.stockMinimo ? "low-stock" : ""}>{p.stock}</td><td>{p.stockMinimo}</td>
            <td><button className="edit-button" onClick={() => { setEditId(p.id); setForm(p); }}>Editar</button>
              <button className="delete-button" onClick={() => { if (window.confirm("¿Eliminar producto?")) ejecutar(() => request("/Productos/" + p.id, { method: "DELETE" }), "Producto eliminado."); }}>Eliminar</button></td></tr>)}</tbody>
        </table></div>
      </section>}
      {seccion === "Categorías" && <section className="table-card">
        <h2>{categoriaEditId ? "Editar categoría" : "Nueva categoría"}</h2>
        <form className="inline-form" onSubmit={guardarCategoria}><input required maxLength={100} placeholder="Nombre" value={categoriaNombre} onChange={e => setCategoriaNombre(e.target.value)} /><button className="primary-button">Guardar</button>
          {categoriaEditId && <button type="button" className="cancel-button" onClick={() => { setCategoriaEditId(null); setCategoriaNombre(""); }}>Cancelar</button>}</form>
        <div className="table-scroll"><table className="products-table"><thead><tr><th>Nombre</th><th>Acciones</th></tr></thead><tbody>{categorias.map(c => <tr key={c.id}><td>{c.nombre}</td><td>
          <button className="edit-button" onClick={() => { setCategoriaEditId(c.id); setCategoriaNombre(c.nombre); }}>Editar</button>
          <button className="delete-button" onClick={() => { if (window.confirm("¿Eliminar categoría?")) ejecutar(() => request("/Categorias/" + c.id, { method: "DELETE" }), "Categoría eliminada."); }}>Eliminar</button>
        </td></tr>)}</tbody></table></div>
      </section>}
      {seccion === "Movimientos" && <section className="table-card">
        <h2>Registrar movimiento</h2>
        <form className="product-form" onSubmit={registrarMovimiento}><div className="form-row">
          <label className="form-group">Producto<select required value={mov.productoId} onChange={e => setMov({ ...mov, productoId: e.target.value })}><option value="">Seleccionar</option>{productos.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.stock} disponibles)</option>)}</select></label>
          <label className="form-group">Tipo<select value={mov.tipo} onChange={e => setMov({ ...mov, tipo: e.target.value })}><option value="entrada">Entrada</option><option value="salida">Salida</option></select></label>
          <label className="form-group">Cantidad<input type="number" min="1" step="1" required value={mov.cantidad} onChange={e => setMov({ ...mov, cantidad: e.target.value })} /></label>
          <label className="form-group">Motivo<input maxLength={150} value={mov.motivo} onChange={e => setMov({ ...mov, motivo: e.target.value })} /></label>
        </div><button className="primary-button">Registrar</button></form>
        <h2>Historial reciente</h2>
        <div className="table-scroll"><table className="products-table"><thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Motivo</th></tr></thead><tbody>{movimientos.map(m => <tr key={m.id}><td>{new Date(m.fecha).toLocaleString("es-AR")}</td><td>{productos.find(p => p.id === m.productoId)?.nombre || m.productoId}</td><td>{m.tipo}</td><td>{m.cantidad}</td><td>{m.motivo || "—"}</td></tr>)}</tbody></table></div>
      </section>}
    </main>
  </div>;
}
