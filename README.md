# StockManager — Sistema de gestión de inventario

**Aplicación web full-stack** para administrar productos, categorías y movimientos de stock desde un panel centralizado.

Desarrollada como proyecto personal de portfolio, con una API REST en **ASP.NET Core 10**, interfaz en **React + Vite** y persistencia en **SQL Server**.

## Funcionalidades

- **Inicio de sesión:** autenticación con JWT y verificación de contraseñas mediante BCrypt.
- **Configuración inicial:** formulario web para crear el primer administrador en una base de datos sin usuarios (solo en Development).
- **Dashboard:** indicadores de productos, categorías, movimientos, stock bajo y productos agotados; actividad reciente.
- **Productos:** alta, consulta, modificación y eliminación; descripción, precio, moneda (ARS/USD), categoría y stock mínimo.
- **Búsqueda y filtros:** por nombre, categoría, moneda y disponibilidad.
- **Categorías:** gestión de categorías de productos.
- **Movimientos de inventario:** registro de entradas y salidas con cantidad, motivo y fecha.
- **Control de existencias:** validación para evitar salidas superiores al stock disponible.
- **Interfaz adaptable:** navegación entre dashboard, productos, categorías y movimientos.

## Tecnologías

| Capa | Tecnologías |
| --- | --- |
| Frontend | React 19, JavaScript, HTML, CSS, Vite 8 |
| Backend | C#, ASP.NET Core 10, Web API REST |
| Datos | SQL Server, Entity Framework Core 10 |
| Autenticación | JWT, BCrypt |
| Documentación de API | Swagger / OpenAPI |
| Herramientas | Visual Studio, VS Code, Git y GitHub |

## Arquitectura y estructura

```text
StockManager/
├── backend/
│   └── StockManager.Api/
│       ├── Controllers/         # Endpoints HTTP
│       ├── Data/                # DbContext y acceso a datos
│       ├── Models/              # Entidades y modelos
│       ├── Program.cs           # Servicios y middleware
│       └── StockManager.Api.csproj
├── frontend/
│   ├── src/
│   │   ├── pages/               # Login, configuración inicial y dashboard
│   │   └── services/            # Cliente de autenticación
│   └── package.json
├── database/
│   └── schema.sql               # Esquema inicial SQL Server
├── StockManager.slnx
└── iniciar-stockmanager.bat     # Inicio local en Windows
```

El frontend consume la API mediante peticiones HTTP(S). La API valida las solicitudes, utiliza Entity Framework Core para consultar o actualizar SQL Server y protege los endpoints correspondientes con JWT.

## Requisitos

- Windows para utilizar el iniciador `.bat` (en otros sistemas, iniciar ambos servidores manualmente).
- **.NET SDK 10**.
- **Node.js y npm** compatibles con Vite 8.
- **SQL Server** y, opcionalmente, SQL Server Management Studio (SSMS).
- Visual Studio o VS Code (opcionales para ejecutar, útiles para desarrollar).

## Instalación y ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/ThyagoASan/StockManager.git
cd StockManager
```

Trabajar sobre la rama `main`.

### 2. Preparar SQL Server

Ejecutar `database/schema.sql` desde SSMS. El script crea `StockManagerDB`, sus tablas y categorías iniciales si no existen.

**Importante:** hacer una copia de seguridad antes de ejecutar scripts sobre una base con datos.

Configurar la cadena de conexión `ConnectionStrings:DefaultConnection` para la instancia local de SQL Server. Puede establecerse mediante configuración local no publicada o la variable de entorno `ConnectionStrings__DefaultConnection`.

### 3. Configurar JWT de forma segura

Desde la carpeta del backend:

```powershell
cd backend/StockManager.Api
dotnet user-secrets set "Jwt:Key" "REEMPLAZAR_POR_UN_SECRETO_ALEATORIO_DE_32_BYTES_O_MAS"
```

El valor anterior es **un ejemplo**, no una clave para utilizar. Generar una clave aleatoria propia y no subirla al repositorio. Configurar también `Jwt:Issuer` y `Jwt:Audience` según la configuración de la aplicación.

### 4. Instalar las dependencias del frontend

Desde la raíz del repositorio:

```powershell
cd frontend
npm install
cd ..
```

### 5. Crear el primer usuario (solo en desarrollo)

**Primero debe ejecutarse `database/schema.sql`** para crear `StockManagerDB` y las tablas `Usuarios`, `Categorias`, `Productos` y `MovimientosStock`. El formulario no crea ni migra las tablas.

Después de configurar la conexión y JWT, iniciá el backend y el frontend siguiendo el paso 6 y abrí `http://127.0.0.1:5173/`.

- Si **no existen usuarios** y la API está ejecutándose en **Development**, el frontend consulta `GET /api/setup/estado` y muestra el formulario para crear el primer administrador.
- Ingresá un correo válido, una contraseña de **al menos 12 caracteres** y su confirmación. El frontend envía `POST /api/setup/admin` y la API guarda el hash con BCrypt, no la contraseña en texto plano.
- Cuando se crea el usuario, la aplicación muestra el inicio de sesión. Ingresá con las credenciales que acabás de elegir.
- Si ya existe algún usuario, el formulario no se muestra y `POST /api/setup/admin` rechaza nuevos intentos con **HTTP 409 Conflict**.

Ambos endpoints de configuración inicial están disponibles **únicamente en Development**. No hay credenciales universales incluidas en el repositorio. **No uses Development para exponer públicamente el servicio**: antes de desplegar en producción se necesita un procedimiento de aprovisionamiento seguro y una configuración específica para ese entorno.

### 6. Iniciar StockManager

**Opción A — Inicio automático en Windows**

Desde la raíz del proyecto, ejecutar:

```text
iniciar-stockmanager.bat
```

El iniciador abre la API y Vite en ventanas separadas, espera a que responda el frontend y abre la aplicación en el navegador. Mantener ambas ventanas abiertas mientras se utiliza StockManager.

**Opción B — Inicio manual**

En una terminal:

```powershell
cd backend/StockManager.Api
dotnet run --launch-profile https
```

En otra terminal, desde la raíz:

```powershell
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Direcciones locales:

| Servicio | URL |
| --- | --- |
| Frontend | http://127.0.0.1:5173 |
| API HTTPS | https://localhost:7228 |
| Swagger UI (Development) | https://localhost:7228/swagger/index.html |

El inicio de sesión del frontend utiliza `https://localhost:7228/api`. El dashboard admite `VITE_API_URL` como alternativa para configurar su URL base. Si se cambian los puertos u orígenes, revisar también la política CORS del backend.

## Flujo de uso

1. En una instalación nueva, crear el administrador desde el formulario de configuración inicial (solo Development) e iniciar sesión.
2. Crear categorías y productos.
3. Consultar o filtrar productos y sus existencias.
4. Registrar entradas y salidas desde **Movimientos**.
5. Revisar el dashboard y la actividad reciente.

Las modificaciones de stock posteriores al alta de un producto deben realizarse mediante movimientos para conservar el historial.

## Capturas de pantalla

El proyecto cuenta con una interfaz de login y un dashboard con indicadores y actividad reciente. Las capturas se incorporarán al repositorio para mostrar visualmente estas pantallas sin depender de un entorno local en ejecución.

## Seguridad y mejoras pendientes

Este repositorio es un **proyecto de desarrollo y portfolio**, no una implementación auditada para producción.

- La clave JWT y las cadenas de conexión sensibles deben permanecer fuera del control de versiones.
- El frontend almacena actualmente el token en `localStorage`; antes de publicar en producción debe evaluarse una estrategia de sesión más segura y reforzar la protección contra XSS.
- Los endpoints de configuración inicial son exclusivos del entorno de desarrollo. Para producción se requiere otro procedimiento seguro de aprovisionamiento.
- El esquema SQL debe prepararse antes del primer inicio; la aplicación no automatiza todavía la creación de tablas ni las migraciones.
- Pendiente: pruebas automatizadas y de integración, revisión de concurrencia en movimientos de stock, autorización por roles, observabilidad y despliegue.
- Antes de un despliegue público, revisar CORS, HTTPS, secretos, permisos y manejo de errores.

## Autor

**Thyago Agustín Sánchez**  
Estudiante de Ingeniería en Sistemas · Proyecto personal full-stack

[GitHub](https://github.com/ThyagoASan)
