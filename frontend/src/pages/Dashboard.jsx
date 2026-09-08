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
      setError("");

      await cargarProductos();
    } catch (error) {
      console.error(error);
      setError("Error al crear producto");
    }
  };

  const editarProducto = (producto) => {
    setProductoEditando({
      ...producto,
    });

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
            id: productoEditando.id,
            nombre: productoEditando.nombre,
            descripcion: productoEditando.descripcion,
            precio: Number(productoEditando.precio),
            stock: Number(productoEditando.stock),
            stockMinimo: Number(productoEditando.stockMinimo),
            categoriaId: Number(productoEditando.categoriaId),
            fechaCreacion: productoEditando.fechaCreacion,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo actualizar el producto");
      }

      setProductoEditando(null);
      setError("");

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

    if (!confirmar) {
      return;
    }

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

      setError("");

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

  return (
    <div>
      <h1>StockManager</h1>

      <button onClick={cerrarSesion}>
        Cerrar sesión
      </button>

      <h2>Productos</h2>

      <button
        onClick={() => {
          setMostrarFormulario(!mostrarFormulario);
          setProductoEditando(null);
        }}
      >
        {mostrarFormulario ? "Cancelar" : "Nuevo producto"}
      </button>

      {mostrarFormulario && (
        <form onSubmit={crearProducto}>
          <h3>Nuevo producto</h3>

          <div>
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              value={nuevoProducto.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Descripción</label>
            <input
              type="text"
              name="descripcion"
              value={nuevoProducto.descripcion}
              onChange={handleChange}
            />
          </div>

          <div>
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

          <div>
            <label>Stock</label>
            <input
              type="number"
              name="stock"
              value={nuevoProducto.stock}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Stock mínimo</label>
            <input
              type="number"
              name="stockMinimo"
              value={nuevoProducto.stockMinimo}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Categoría ID</label>
            <input
              type="number"
              name="categoriaId"
              value={nuevoProducto.categoriaId}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit">
            Guardar producto
          </button>
        </form>
      )}

      {productoEditando && (
        <form onSubmit={guardarEdicion}>
          <h3>Editar producto</h3>

          <div>
            <label>Nombre</label>
            <input
              type="text"
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

          <div>
            <label>Descripción</label>
            <input
              type="text"
              value={productoEditando.descripcion || ""}
              onChange={(e) =>
                setProductoEditando({
                  ...productoEditando,
                  descripcion: e.target.value,
                })
              }
            />
          </div>

          <div>
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
              required
            />
          </div>

          <div>
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
              required
            />
          </div>

          <div>
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
              required
            />
          </div>

          <div>
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
              required
            />
          </div>

          <button type="submit">
            Guardar cambios
          </button>

          <button
            type="button"
            onClick={() => setProductoEditando(null)}
          >
            Cancelar
          </button>
        </form>
      )}

      {error && <p>{error}</p>}

      <table border="1">
        <thead>
          <tr>
            <th>Id</th>
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
              <td>{producto.stock}</td>
              <td>{producto.stockMinimo}</td>

              <td>
                <button
                  onClick={() => editarProducto(producto)}
                >
                  Editar
                </button>

                <button
                  onClick={() => eliminarProducto(producto.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;