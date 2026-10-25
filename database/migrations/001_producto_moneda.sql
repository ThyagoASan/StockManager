USE StockManagerDB;
GO
IF COL_LENGTH('dbo.Productos', 'Moneda') IS NULL
BEGIN
    ALTER TABLE dbo.Productos ADD Moneda NVARCHAR(3) NOT NULL CONSTRAINT DF_Productos_Moneda DEFAULT 'ARS';
END;
GO
UPDATE dbo.Productos SET Moneda = 'ARS' WHERE Moneda IS NULL OR Moneda NOT IN ('ARS', 'USD');
GO
