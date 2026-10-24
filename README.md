# StockManager | Sistema de gestión de inventario

Aplicación **full-stack** para administrar productos, categorías y movimientos de stock. Proyecto personal desarrollado para practicar la construcción de aplicaciones web con **React, ASP.NET Core y SQL Server**.

## Tecnologías utilizadas

| Área | Tecnologías |
|---|---|
| Frontend | React, JavaScript, Vite |
| Backend | C#, ASP.NET Core 10 Web API |
| Persistencia | Entity Framework Core, SQL Server |
| Seguridad | Autenticación con JWT |
| Documentación de API | OpenAPI / Swagger |
| Control de versiones | Git y GitHub |

## Funcionalidades del proyecto

- Inicio de sesión y manejo de autenticación mediante tokens JWT.
- Gestión de productos y categorías.
- Registro y consulta de movimientos de inventario.
- Comunicación entre el frontend React y la API REST.
- Operaciones de consulta y mantenimiento de datos mediante Entity Framework Core.

## Arquitectura

El proyecto separa la interfaz de usuario de la API y la persistencia:

```text
React (frontend)
      |
      | HTTP / JSON
      v
ASP.NET Core Web API (backend)
      |
      v
Entity Framework Core
      |
      v
SQL Server
```

Esta estructura permite desarrollar y mantener la interfaz y los servicios del servidor de forma independiente.

## Estructura general

- `frontend/`: aplicación React creada con Vite.
- `backend/StockManager.Api/`: proyecto Web API en .NET 10.

## Requisitos

- .NET SDK 10.
- Node.js y npm compatibles con la versión de Vite del proyecto.
- SQL Server.
- Un editor como Visual Studio o Visual Studio Code.

## Ejecución local

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/ThyagoASan/StockManager.git
   ```

2. Configurar la conexión local a SQL Server y los valores de autenticación necesarios en el backend. No subir contraseñas ni claves reales al repositorio.
3. Desde `backend/StockManager.Api/`, restaurar dependencias y ejecutar la API:

   ```bash
   dotnet restore
   dotnet run
   ```

4. Desde `frontend/`, instalar dependencias e iniciar el cliente:

   ```bash
   npm install
   npm run dev
   ```

5. Configurar la URL de la API que consume el frontend según los puertos locales del entorno.

**Nota:** los pasos de configuración y ejecución requieren verificación en una instalación nueva; pueden ser necesarios ajustes de base de datos, migraciones, puertos o variables de entorno.

## Aprendizajes y objetivos

Este proyecto me permite poner en práctica:

- Desarrollo de APIs REST con C# y ASP.NET Core.
- Integración frontend-backend con React.
- Modelado y persistencia de datos con Entity Framework Core.
- Autenticación basada en JWT.
- Organización y evolución de un proyecto full-stack.

## Autor

**Thyago Agustín Sánchez**  
Estudiante de Ingeniería en Sistemas · Proyecto personal de portfolio

[Perfil de GitHub](https://github.com/ThyagoASan)
