
BEGIN;

-- Registrar automaticamente cambios de tecnico y estado
CREATE OR REPLACE FUNCTION registrar_auditoria_incidentes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    -- Registrar asignaciones y reasignaciones
    IF NEW.tecnico_asignado IS DISTINCT FROM OLD.tecnico_asignado THEN

        INSERT INTO comentarios (
            incidente_id,
            autor,
            contenido
        )
        VALUES (
            NEW.id,
            'Sistema',
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

    -- Registrar cambios de estado
    IF NEW.estado IS DISTINCT FROM OLD.estado THEN

        INSERT INTO comentarios (
            incidente_id,
            autor,
            contenido
        )
        VALUES (
            NEW.id,
            'Sistema',
            'Cambio de estado: '
            || OLD.estado
            || ' -> '
            || NEW.estado
        );

    END IF;

    RETURN NEW;
END;
$$;

-- Evitar duplicar triggers si se ejecuta nuevamente
DROP TRIGGER IF EXISTS trg_auditoria_incidentes
ON incidentes;

CREATE TRIGGER trg_auditoria_incidentes
AFTER UPDATE OF tecnico_asignado, estado
ON incidentes
FOR EACH ROW
EXECUTE FUNCTION registrar_auditoria_incidentes();

COMMIT;
