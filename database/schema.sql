USE StockManagerDB;
GO

CREATE TABLE Usuarios (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FechaCreacion DATETIME DEFAULT GETDATE()
);

CREATE TABLE Categorias (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Productos (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(150) NOT NULL,
    Descripcion NVARCHAR(255),
    Precio DECIMAL(10,2) NOT NULL,
    Stock INT NOT NULL,
    StockMinimo INT NOT NULL DEFAULT 5,
    CategoriaId INT NOT NULL,
    FechaCreacion DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Productos_Categorias
    FOREIGN KEY (CategoriaId) REFERENCES Categorias(Id)
);

CREATE TABLE MovimientosStock (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductoId INT NOT NULL,
    Tipo NVARCHAR(20) NOT NULL,
    Cantidad INT NOT NULL,
    Motivo NVARCHAR(150),
    Fecha DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_MovimientosStock_Productos
    FOREIGN KEY (ProductoId) REFERENCES Productos(Id)
);

INSERT INTO Categorias (Nombre)
VALUES 
('Electrónica'),
('Alimentos'),
('Limpieza'),
('Ropa'),
('Herramientas');

INSERT INTO Usuarios (Nombre, Email, PasswordHash)
VALUES 
('Admin', 'admin@stockmanager.com', '123456');