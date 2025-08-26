CREATE TABLE cajamovimiento (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 10000000 INCREMENT BY 1),
    fechaorigen TIMESTAMP NULL,
    proveedor VARCHAR(255) NOT NULL,
    comprobante VARCHAR(255) NOT NULL,
    nrocomprobante BIGINT NULL,
    fechavencimiento TIMESTAMP NULL,
    importeefectivo NUMERIC(18, 2) NULL,
    importecheque NUMERIC(18, 2) NULL,
    importeafectado NUMERIC(18, 2) NULL,
    importeneto NUMERIC(18, 2) NULL,
    estado VARCHAR(4) NULL
);

ALTER TABLE cajamovimiento
    ADD CONSTRAINT fk_comprobante
    FOREIGN KEY (comprobante) REFERENCES Comprobante(Codigo)
    ON DELETE RESTRICT;

CREATE TABLE cajaafectacion (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 10000000 INCREMENT BY 1),
    cajamovimiento BIGINT NOT NULL,
    factura BIGINT NOT NULL,
    importeafectado NUMERIC(18, 2) NULL,

    CONSTRAINT fk_cajamovimiento
        FOREIGN KEY (cajamovimiento)
        REFERENCES cajamovimiento(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_factura
        FOREIGN KEY (factura)
        REFERENCES wFactura(id)
        ON DELETE RESTRICT

);
 
CREATE INDEX idx_cajaafectacion_factura ON CajaAfectacion(factura);
CREATE INDEX idx_cajaafectacion_cajamovimiento ON CajaAfectacion(cajamovimiento);
