import { useEffect, useState } from "react";

function Dashboard() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    stockMinimo: "",
    categoriaId: 1,
  });

  const cargarProductos = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5009/api/Productos",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("No se pudieron cargar los productos");
      }

      const data = await response.json();
      setProductos(data);
      setError("");
    } catch (error) {
      console.error(error);
      setError("Error al cargar productos");
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setNuevoProducto({
      ...nuevoProducto,
      [name]: value,
    });
  };

  const crearProducto = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5009/api/Productos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre: nuevoProducto.nombre,
            descripcion: nuevoProducto.descripcion,
            precio: Number(nuevoProducto.precio),
            stock: Number(nuevoProducto.stock),
            stockMinimo: Number(nuevoProducto.stockMinimo),
            categoriaId: Number(nuevoProducto.categoriaId),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo crear el producto");
      }

      setNuevoProducto({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        stockMinimo: "",
        categoriaId: 1,
      });

      setMostrarFormulario(false);
      await cargarProductos();
    } catch (error) {
      console.error(error);
      setError("Error al crear producto");
    }
  };

  const editarProducto = (producto) => {
    setProductoEditando({ ...producto });
    setMostrarFormulario(false);
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5009/api/Productos/${productoEditando.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...productoEditando,
            precio: Number(productoEditando.precio),
            stock: Number(productoEditando.stock),
            stockMinimo: Number(productoEditando.stockMinimo),
            categoriaId: Number(productoEditando.categoriaId),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo actualizar el producto");
      }

      setProductoEditando(null);
      await cargarProductos();
    } catch (error) {
      console.error(error);
      setError("Error al actualizar producto");
    }
  };

  const eliminarProducto = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que querés eliminar este producto?"
    );

    if (!confirmar) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5009/api/Productos/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo eliminar el producto");
      }

      await cargarProductos();
    } catch (error) {
      console.error(error);
      setError("Error al eliminar producto");
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const stockBajo = productos.filter(
    (p) => p.stock <= p.stockMinimo
  ).length;

  const sinStock = productos.filter(
    (p) => p.stock === 0
  ).length;

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>StockManager</h2>

        <div className="sidebar-item active">
          Dashboard
        </div>

        <div className="sidebar-item">
          Productos
        </div>

        <div className="sidebar-item">
          Categorías
        </div>

        <div className="sidebar-item">
          Movimientos
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Gestión de inventario</p>
          </div>

          <button
            className="logout-button"
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>
        </div>

        <section className="stats">
          <div className="stat-card">
            <h3>Productos</h3>
            <strong>{productos.length}</strong>
          </div>

          <div className="stat-card">
            <h3>Stock bajo</h3>
            <strong>{stockBajo}</strong>
          </div>

          <div className="stat-card">
            <h3>Sin stock</h3>
            <strong>{sinStock}</strong>
          </div>
        </section>

        <section className="table-card">
          <div className="actions">
            <h2>Productos</h2>

            <button
              className="new-button"
              onClick={() => {
                setMostrarFormulario(!mostrarFormulario);
                setProductoEditando(null);
              }}
            >
              {mostrarFormulario ? "Cancelar" : "Nuevo producto"}
            </button>
          </div>

          {mostrarFormulario && (
            <form
              className="product-form"
              onSubmit={crearProducto}
            >
              <h3>Nuevo producto</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    name="nombre"
                    value={nuevoProducto.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <input
                    name="descripcion"
                    value={nuevoProducto.descripcion}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio"
                    value={nuevoProducto.precio}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={nuevoProducto.stock}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Stock mínimo</label>
                  <input
                    type="number"
                    name="stockMinimo"
                    value={nuevoProducto.stockMinimo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Categoría ID</label>
                  <input
                    type="number"
                    name="categoriaId"
                    value={nuevoProducto.categoriaId}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button
                className="primary-button"
                type="submit"
              >
                Guardar producto
              </button>
            </form>
          )}

          {productoEditando && (
            <form
              className="product-form"
              onSubmit={guardarEdicion}
            >
              <h3>Editar producto</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    value={productoEditando.nombre}
                    onChange={(e) =>
                      setProductoEditando({
                        ...productoEditando,
                        nombre: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <input
                    value={productoEditando.descripcion || ""}
                    onChange={(e) =>
                      setProductoEditando({
                        ...productoEditando,
                        descripcion: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productoEditando.precio}
                    onChange={(e) =>
                      setProductoEditando({
                        ...productoEditando,
                        precio: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    value={productoEditando.stock}
                    onChange={(e) =>
                      setProductoEditando({
                        ...productoEditando,
                        stock: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Stock mínimo</label>
                  <input
                    type="number"
                    value={productoEditando.stockMinimo}
                    onChange={(e) =>
                      setProductoEditando({
                        ...productoEditando,
                        stockMinimo: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Categoría ID</label>
                  <input
                    type="number"
                    value={productoEditando.categoriaId}
                    onChange={(e) =>
                      setProductoEditando({
                        ...productoEditando,
                        categoriaId: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="primary-button"
                  type="submit"
                >
                  Guardar cambios
                </button>

                <button
                  className="cancel-button"
                  type="button"
                  onClick={() => setProductoEditando(null)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {error && <p>{error}</p>}

          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Stock mínimo</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.id}</td>
                  <td>{producto.nombre}</td>
                  <td>${producto.precio}</td>

                  <td
                    className={
                      producto.stock <= producto.stockMinimo
                        ? "low-stock"
                        : ""
                    }
                  >
                    {producto.stock}
                  </td>

                  <td>{producto.stockMinimo}</td>

                  <td>
                    <button
                      className="edit-button"
                      onClick={() => editarProducto(producto)}
                    >
                      Editar
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        eliminarProducto(producto.id)
                      }
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;