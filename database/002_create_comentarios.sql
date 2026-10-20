
BEGIN;

-- Tabla para almacenar comentarios de seguimiento
CREATE TABLE IF NOT EXISTS comentarios (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    incidente_id INTEGER NOT NULL
        REFERENCES incidentes(id) ON DELETE CASCADE,

    autor VARCHAR(120) NOT NULL
        CHECK (LENGTH(TRIM(autor)) >= 2),

    contenido TEXT NOT NULL
        CHECK (LENGTH(TRIM(contenido)) >= 3),

    creado_en TIMESTAMP WITH TIME ZONE
        NOT NULL DEFAULT NOW()
);

-- Indice para consultar el historial de cada incidente
CREATE INDEX IF NOT EXISTS idx_comentarios_incidente_fecha
ON comentarios (incidente_id, creado_en DESC);

COMMIT;
