
BEGIN;

-- AB#13: Registrar al responsable de cada operación.
-- Si no se proporciona, conservar "Sistema".

CREATE OR REPLACE FUNCTION registrar_auditoria_incidentes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    autor_evento VARCHAR(120);
BEGIN
    -- Obtener el responsable de la transacción actual.
    autor_evento := NULLIF(
        LEFT(
            BTRIM(current_setting('app.responsable', TRUE)),
            120
        ),
        ''
    );

    IF autor_evento IS NULL OR LENGTH(autor_evento) < 2 THEN
        autor_evento := 'Sistema';
    END IF;

    -- Registrar asignaciones y reasignaciones.
    IF NEW.tecnico_asignado IS DISTINCT FROM OLD.tecnico_asignado THEN

        INSERT INTO comentarios (
            incidente_id,
            autor,
            contenido
        )
        VALUES (
            NEW.id,
            autor_evento,
            CASE
                WHEN OLD.tecnico_asignado IS NULL THEN
                    'Tecnico asignado: ' || NEW.tecnico_asignado

                WHEN NEW.tecnico_asignado IS NULL THEN
                    'Tecnico desasignado: ' || OLD.tecnico_asignado

                ELSE
                    'Tecnico reasignado: '
                    || OLD.tecnico_asignado
                    || ' -> '
                    || NEW.tecnico_asignado
            END
        );

    END IF;

    -- Registrar cambios de estado.
    IF NEW.estado IS DISTINCT FROM OLD.estado THEN

        INSERT INTO comentarios (
            incidente_id,
            autor,
            contenido
        )
        VALUES (
            NEW.id,
            autor_evento,
            'Cambio de estado: '
            || OLD.estado
            || ' -> '
            || NEW.estado
        );

    END IF;

    RETURN NEW;
END;
$$;

COMMIT;
