CREATE TABLE wFactura (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 10000000 INCREMENT BY 1),
    fechaOrigen TIMESTAMP NULL,
    proveedor VARCHAR(255) NOT NULL,
    comprobante VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    nroComprobante BIGINT NULL,
    fechaVencimiento TIMESTAMP NULL,
    formaPago VARCHAR(100),
    pagoAutomatico BOOLEAN NULL DEFAULT FALSE,
    importeSubtotal MONEY NULL,
    importeIngrBru MONEY NULL,
    importeIva MONEY NULL,
    alicuotaIngrBru NUMERIC(5,2) NULL,
    alicuotaIVA NUMERIC(5,2) NULL,
    importeTotal MONEY NULL,
    importePendAfectar MONEY NULL,
    afecta INT NULL,
    estado VARCHAR(4)
);

CREATE TABLE Comprobante (
    Codigo VARCHAR(100) PRIMARY KEY,
    Descripcion VARCHAR(255) NOT NULL,
    DC VARCHAR(10),
    Visible INT DEFAULT 1
);

CREATE TABLE FormaPago (
    Codigo VARCHAR(100) PRIMARY KEY,
    Descripcion VARCHAR(255) NOT NULL,
    Visible INT DEFAULT 1
);

ALTER TABLE wFactura
    ADD CONSTRAINT fk_comprobante
    FOREIGN KEY (comprobante) REFERENCES Comprobante(Codigo)
    ON DELETE RESTRICT;

ALTER TABLE wFactura
    ADD CONSTRAINT fk_formapago
    FOREIGN KEY (formaPago) REFERENCES FormaPago(Codigo)
    ON DELETE RESTRICT;
