CREATE TABLE wFactura (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 10000000 INCREMENT BY 1),
    fechaorigen TIMESTAMP NULL,
    proveedor VARCHAR(255) NOT NULL,
    comprobante VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    nrocomprobante BIGINT NULL,
    fechavencimiento TIMESTAMP NULL,
    formapago VARCHAR(100),
    pagoautomatico BOOLEAN NULL DEFAULT FALSE,
    importesubtotal NUMERIC(18, 2) NULL,
    importeingrbru NUMERIC(18, 2) NULL,
    importeiva NUMERIC(18, 2) NULL,
    alicuotaingrbru NUMERIC(5,2) NULL,
    alicuotaiva NUMERIC(5,2) NULL,
    importetotal NUMERIC(18, 2) NULL,
    importependafectar NUMERIC(18, 2) NULL,
    afecta INT NULL,
    estado VARCHAR(4) NULL
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
