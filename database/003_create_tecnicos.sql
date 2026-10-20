
BEGIN;

-- Catalogo de tecnicos disponibles
CREATE TABLE IF NOT EXISTS tecnicos (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    nombre VARCHAR(120) NOT NULL UNIQUE
        CHECK (LENGTH(TRIM(nombre)) >= 3),

    especialidad VARCHAR(80) NOT NULL
        CHECK (LENGTH(TRIM(especialidad)) >= 3),

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tecnicos de ejemplo para las pruebas
INSERT INTO tecnicos (nombre, especialidad)
VALUES
    ('Tecnico de soporte', 'Hardware'),
    ('Tecnico de redes', 'Redes'),
    ('Tecnico de sistemas', 'Software')
ON CONFLICT (nombre) DO NOTHING;

COMMIT;
