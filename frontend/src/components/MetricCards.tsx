
import type { Incidente } from "../types/incidente";
import type { Estadisticas } from "../api/estadisticas";

interface Props {
  incidentes: Incidente[];
  estadisticas?: Estadisticas | null;
}

export function MetricCards({
  incidentes,
  estadisticas,
}: Props) {
  // Cálculo temporal mientras se conecta la API.
  // Cuando se reciben estadísticas, usamos PostgreSQL.
  const abiertosLocal = incidentes.filter((incidente) =>
    ["NUEVO", "ASIGNADO", "EN_PROCESO"].includes(
      incidente.estado
    )
  ).length;

  const criticosLocal = incidentes.filter(
    (incidente) =>
      incidente.prioridad === "CRITICA" &&
      ["NUEVO", "ASIGNADO", "EN_PROCESO"].includes(
        incidente.estado
      )
  ).length;

  const cerradosLocal = incidentes.filter(
    (incidente) => incidente.estado === "CERRADO"
  ).length;

  const metricas = [
    {
      etiqueta: "Total de incidentes",
      valor: estadisticas?.total ?? incidentes.length,
      clase: "metric-blue",
      simbolo: "◫",
      descripcion: "Registrados en el sistema",
    },
    {
      etiqueta: "Incidentes abiertos",
      valor: estadisticas?.abiertos ?? abiertosLocal,
      clase: "metric-orange",
      simbolo: "◷",
      descripcion: "Nuevos, asignados o en proceso",
    },
    {
      etiqueta: "Críticos activos",
      valor: estadisticas?.criticos_activos ?? criticosLocal,
      clase: "metric-red",
      simbolo: "!",
      descripcion: "Casos críticos pendientes",
    },
    {
      etiqueta: "Incidentes cerrados",
      valor: estadisticas?.cerrados ?? cerradosLocal,
      clase: "metric-green",
      simbolo: "✓",
      descripcion: "Casos con atención finalizada",
    },
  ];

  return (
    <section
      className="metrics"
      aria-label="Resumen de incidentes"
    >
      {metricas.map((metrica) => (
        <article
          className="metric-card"
          key={metrica.etiqueta}
        >
          <div className="metric-top">
            <span className="metric-label">
              {metrica.etiqueta}
            </span>

            <span
              className={`metric-icon ${metrica.clase}`}
              aria-hidden="true"
            >
              {metrica.simbolo}
            </span>
          </div>

          <strong className="metric-value">
            {metrica.valor}
          </strong>

          <span className="metric-description">
            {metrica.descripcion}
          </span>
        </article>
      ))}
    </section>
  );
}
