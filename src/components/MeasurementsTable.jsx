export default function MeasurementsTable({ pipelines }) {
  if (!pipelines || pipelines.length === 0) {
    return <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>Sin datos de líneas.</p>
  }

  const rows = pipelines.map(pl => {
    const vals = pl.measurements?.map(m => Number(m.thickness_mm)).filter(Boolean) || []
    const min = vals.length ? Math.min(...vals) : null
    const max = vals.length ? Math.max(...vals) : null
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null

    const getClass = (v) => {
      if (!v) return ''
      if (v < 8) return 'text-red'
      if (v < 9) return 'text-yellow'
      return 'text-green'
    }

    const status = min === null ? '—' : min < 8 ? 'Crítico' : min < 9 ? 'Vigilancia' : 'OK'
    const statusCls = min === null ? '' : min < 8 ? 'badge-red' : min < 9 ? 'badge-yellow' : 'badge-green'

    return { pl, min, max, avg, getClass, status, statusCls }
  })

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>TAG Línea</th>
            <th>Ø</th>
            <th>Tipo</th>
            <th>Mín (mm)</th>
            <th>Máx (mm)</th>
            <th>Prom (mm)</th>
            <th>Lecturas</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ pl, min, max, avg, getClass, status, statusCls }) => (
            <tr key={pl.id}>
              <td style={{ fontFamily: 'monospace', fontSize: '0.73rem' }}>{pl.tag}</td>
              <td style={{ color: 'var(--text-dim)' }}>{pl.diameter_inches}"</td>
              <td style={{ color: 'var(--text-dim)' }}>{ELEMENT_LABELS[pl.element_type] || pl.element_type}</td>
              <td className={getClass(min)}>{min ? min.toFixed(2) : '—'}</td>
              <td>{max ? max.toFixed(2) : '—'}</td>
              <td style={{ color: 'var(--accent)' }}>{avg ? avg.toFixed(2) : '—'}</td>
              <td style={{ color: 'var(--text-dim)' }}>{pl.measurements?.length || 0}</td>
              <td><span className={`badge ${statusCls}`}>{status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const ELEMENT_LABELS = {
  STRAIGHT: 'Tramo Recto',
  ELBOW_90: 'Codo 90°',
  TEE: 'Tee',
  REDUCER: 'Reductor',
  LAUNCHER: 'Trampa',
}
