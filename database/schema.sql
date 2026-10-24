IF DB_ID('StockManagerDB') IS NULL CREATE DATABASE StockManagerDB;
GO
USE StockManagerDB;
GO
IF OBJECT_ID('dbo.Usuarios', 'U') IS NULL
CREATE TABLE Usuarios (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FechaCreacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
IF OBJECT_ID('dbo.Categorias', 'U') IS NULL
CREATE TABLE Categorias (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL UNIQUE
);
IF OBJECT_ID('dbo.Productos', 'U') IS NULL
CREATE TABLE Productos (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(150) NOT NULL,
    Descripcion NVARCHAR(255),
    Precio DECIMAL(10,2) NOT NULL CHECK (Precio >= 0),
    Stock INT NOT NULL CHECK (Stock >= 0),
    StockMinimo INT NOT NULL DEFAULT 5 CHECK (StockMinimo >= 0),
    CategoriaId INT NOT NULL REFERENCES Categorias(Id),
    FechaCreacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
IF OBJECT_ID('dbo.MovimientosStock', 'U') IS NULL
CREATE TABLE MovimientosStock (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductoId INT NOT NULL REFERENCES Productos(Id),
    Tipo NVARCHAR(20) NOT NULL CHECK (Tipo IN ('entrada','salida')),
    Cantidad INT NOT NULL CHECK (Cantidad > 0),
    Motivo NVARCHAR(150),
    Fecha DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
IF NOT EXISTS (SELECT 1 FROM Categorias)
INSERT INTO Categorias (Nombre) VALUES (N'Electrónica'), (N'Alimentos'), (N'Limpieza'), (N'Ropa'), (N'Herramientas');
GO
-- Crear el primer usuario con BCrypt (no guardar contraseñas en texto plano).
