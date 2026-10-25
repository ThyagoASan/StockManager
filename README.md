# StockManager | Gestión de inventario full-stack

Proyecto personal con **React + Vite**, **ASP.NET Core 10**, **Entity Framework Core** y **SQL Server**.

## Funcionalidades implementadas en la rama de desarrollo

- Inicio de sesión con JWT y contraseñas verificadas mediante BCrypt.
- CRUD de productos y categorías.
- Entradas y salidas de inventario con registro de movimientos.
- Prevención de salidas superiores al stock disponible.
- Indicadores de productos con stock bajo o agotado.
- Navegación entre dashboard, productos, categorías y movimientos.
- Validaciones básicas y endpoints protegidos por autenticación.

> **Estado:** implementación en revisión. No se ha verificado la compilación del backend ni las pruebas de integración con SQL Server en un entorno real. No desplegar en producción sin validar y reforzar seguridad.

## Requisitos

- .NET SDK 10
- Node.js compatible con Vite 8 y npm
- SQL Server
- Visual Studio / VS Code

## Preparación local

1. Clonar el repositorio y cambiar a la rama de desarrollo:
   ```bash
   git clone https://github.com/ThyagoASan/StockManager.git
   cd StockManager
   git switch feature/completar-stockmanager
   ```
2. Ejecutar `database/schema.sql` en SQL Server Management Studio. El script crea la base `StockManagerDB`, las tablas y las categorías iniciales si no existen. **Hacer respaldo antes de aplicarlo a una base existente**.
3. Ajustar la cadena de conexión en configuración local o mediante `ConnectionStrings__DefaultConnection`.
4. Configurar la clave JWT **fuera del repositorio**:
   ```bash
   cd backend/StockManager.Api
   dotnet user-secrets init
   dotnet user-secrets set "Jwt:Key" "REEMPLAZAR_POR_UNA_CLAVE_ALEATORIA_DE_32_BYTES_O_MAS"
   dotnet run --launch-profile http
   ```
   El valor mostrado es solo un marcador: generar una clave secreta aleatoria real. Nunca publicarla.
5. Crear el primer usuario **solo en desarrollo**, mientras no haya usuarios, enviando un POST JSON a `http://localhost:5009/api/setup/admin`:
   ```json
   {"email":"admin@ejemplo.local","password":"UnaClaveLocalLargaYUnica2026!"}
   ```
   El endpoint deja de admitir inicialización cuando existe un usuario y no está disponible fuera del entorno Development.
6. Iniciar el frontend desde otra terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Por defecto la aplicación utiliza `http://localhost:5009/api`; se puede cambiar mediante `VITE_API_URL` en un archivo `.env.local` del frontend.
7. Abrir la dirección local que muestra Vite, iniciar sesión y comprobar CRUD de categorías y productos, movimientos de entrada y salida y actualización de indicadores.

## Estructura

- `backend/StockManager.Api/`: API, autenticación, controladores y modelos.
- `frontend/src/`: interfaz React.
- `database/schema.sql`: esquema SQL Server.

## Seguridad y limitaciones

- La clave JWT debe configurarse mediante secretos locales o variables de entorno.
- No usar contraseñas fijas ni guardar credenciales en el repositorio.
- El token se guarda actualmente en `localStorage`; para producción se requiere revisar la estrategia de sesión y las defensas contra XSS.
- La inicialización del administrador es una herramienta de desarrollo, no un sistema de registro público.
- Las operaciones sobre stock deben hacerse desde **Movimientos**; editar un producto no altera directamente las existencias.
- Pendiente: pruebas automatizadas, revisión de concurrencia, manejo de errores y autorización por roles, migraciones controladas, endurecimiento de seguridad y despliegue.

## Autor

**Thyago Agustín Sánchez** — Estudiante de Ingeniería en Sistemas.

[Perfil de GitHub](https://github.com/ThyagoASan)
