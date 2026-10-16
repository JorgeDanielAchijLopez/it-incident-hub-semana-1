
BEGIN;

CREATE TABLE IF NOT EXISTS incidentes (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    titulo VARCHAR(150) NOT NULL
        CHECK (LENGTH(TRIM(titulo)) >= 5),

    descripcion TEXT NOT NULL
        CHECK (LENGTH(TRIM(descripcion)) >= 10),

    categoria VARCHAR(80) NOT NULL,

    prioridad VARCHAR(10) NOT NULL
        CHECK (prioridad IN (
            'BAJA', 'MEDIA', 'ALTA', 'CRITICA'
        )),

    usuario_reporta VARCHAR(120) NOT NULL,

    tecnico_asignado VARCHAR(120),

    estado VARCHAR(20) NOT NULL DEFAULT 'NUEVO'
        CHECK (estado IN (
            'NUEVO',
            'ASIGNADO',
            'EN_PROCESO',
            'RESUELTO',
            'CERRADO'
        )),

    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidentes_estado
ON incidentes (estado);

CREATE INDEX IF NOT EXISTS idx_incidentes_prioridad
ON incidentes (prioridad);

COMMIT;
