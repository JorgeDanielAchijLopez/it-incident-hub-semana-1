
import type { Estadisticas } from '../api/estadisticas'

interface Props {
  estadisticas: Estadisticas
}

export function Distribuciones({ estadisticas }: Props) {
  const categorias = estadisticas.por_categoria
  const tecnicos = estadisticas.por_tecnico

  const maxCategorias = Math.max(
    1,
    ...categorias.map((item) => item.total)
  )

  const maxTecnicos = Math.max(
    1,
    ...tecnicos.map((item) => item.abiertos)
  )

  return (
    <section
      aria-label="Distribución de incidentes"
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: 18,
        marginBottom: 27,
      }}
    >
      <article className="panel">
        <div className="panel-heading">
          <div>
            <h2>Incidentes por categoría</h2>
            <p>Distribución general desde PostgreSQL</p>
          </div>
        </div>

        <div style={{ padding: '0 26px 26px' }}>
          {categorias.length === 0 ? (
            <p>No hay categorías registradas.</p>
          ) : (
            categorias.map((item) => (
              <div
                key={item.categoria}
                style={{ marginBottom: 20 }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    marginBottom: 9,
                    fontSize: 12,
                    color: '#405570',
                  }}
                >
                  <strong>{item.categoria}</strong>
                  <strong>{item.total}</strong>
                </div>

                <div
                  role="img"
                  aria-label={`${item.categoria}: ${item.total} incidentes`}
                  style={{
                    height: 10,
                    background: '#edf1f8',
                    borderRadius: 20,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${
                        (item.total / maxCategorias) * 100
                      }%`,
                      height: '100%',
                      background: '#3668e9',
                      borderRadius: 20,
                    }}
                  />
                </div>

                <small
                  style={{
                    display: 'block',
                    marginTop: 7,
                    color: '#8292a9',
                  }}
                >
                  {item.abiertos} abiertos de {item.total}
                </small>
              </div>
            ))
          )}
        </div>
      </article>

      <article className="panel">
        <div className="panel-heading">
          <div>
            <h2>Carga de trabajo por técnico</h2>
            <p>Incidentes abiertos por responsable</p>
          </div>
        </div>

        <div style={{ padding: '0 26px 26px' }}>
          {tecnicos.length === 0 ? (
            <p>No hay incidentes asignados.</p>
          ) : (
            tecnicos.map((item) => (
              <div
                key={item.tecnico}
                style={{ marginBottom: 20 }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    marginBottom: 9,
                    fontSize: 12,
                    color: '#405570',
                  }}
                >
                  <strong>{item.tecnico}</strong>
                  <strong>{item.abiertos}</strong>
                </div>

                <div
                  role="img"
                  aria-label={`${item.tecnico}: ${item.abiertos} incidentes abiertos`}
                  style={{
                    height: 10,
                    background: '#edf1f8',
                    borderRadius: 20,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${
                        (item.abiertos / maxTecnicos) * 100
                      }%`,
                      height: '100%',
                      background: '#20a77b',
                      borderRadius: 20,
                    }}
                  />
                </div>

                <small
                  style={{
                    display: 'block',
                    marginTop: 7,
                    color: '#8292a9',
                  }}
                >
                  {item.abiertos} abiertos · {item.total} en total
                </small>
              </div>
            ))
          )}
        </div>
      </article>
    </section>
  )
}
