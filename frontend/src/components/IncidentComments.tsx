
import { useEffect, useState, type FormEvent } from "react";
import {
  crearComentario,
  listarComentarios,
  type Comentario,
} from "../api/comentarios";

interface Props {
  incidenteId: number;
}

export default function IncidentComments({ incidenteId }: Props) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [autor, setAutor] = useState("");
  const [contenido, setContenido] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    listarComentarios(incidenteId, controller.signal)
      .then((datos) => {
        if (!controller.signal.aborted) {
          setComentarios(datos);
          setError("");
        }
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo consultar el historial."
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      });

    return () => controller.abort();
  }, [incidenteId]);

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (autor.trim().length < 2 || contenido.trim().length < 3) {
      setError("Completá correctamente el autor y el comentario.");
      return;
    }

    setGuardando(true);
    setError("");

    try {
      const nuevo = await crearComentario(incidenteId, {
        autor: autor.trim(),
        contenido: contenido.trim(),
      });

      setComentarios((actuales) => [...actuales, nuevo]);
      setContenido("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar el comentario."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="incident-comments">
      <h3>Comentarios de seguimiento</h3>

      {cargando && <p>Cargando historial...</p>}

      {error && <p role="alert">{error}</p>}

      {!cargando && comentarios.length === 0 && (
        <p>Este incidente todavía no tiene comentarios.</p>
      )}

      {!cargando && (
        <div className="comments-history">
          {comentarios.map((comentario) => (
            <article key={comentario.id} className="comment-item">
              <strong>{comentario.autor}</strong>

              <small>
                {new Date(comentario.creado_en).toLocaleString("es-GT")}
              </small>

              <p>{comentario.contenido}</p>
            </article>
          ))}
        </div>
      )}

      <form onSubmit={manejarEnvio} className="comment-form">
        <h4>Agregar comentario</h4>

        <label htmlFor={`comentario-autor-${incidenteId}`}>
          Nombre del autor
        </label>

        <input
          id={`comentario-autor-${incidenteId}`}
          type="text"
          value={autor}
          onChange={(evento) => setAutor(evento.target.value)}
          minLength={2}
          maxLength={120}
          required
          placeholder="Ej. Soporte TI"
        />

        <label htmlFor={`comentario-texto-${incidenteId}`}>
          Comentario
        </label>

        <textarea
          id={`comentario-texto-${incidenteId}`}
          value={contenido}
          onChange={(evento) => setContenido(evento.target.value)}
          minLength={3}
          maxLength={5000}
          required
          placeholder="Describí el seguimiento realizado..."
          rows={4}
        />

        <button type="submit" disabled={guardando}>
          {guardando ? "Guardando..." : "Publicar comentario"}
        </button>
      </form>
    </section>
  );
}
