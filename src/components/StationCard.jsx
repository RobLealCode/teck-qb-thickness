export default function StationCard({ station, inspection, minThickness, avgThickness, lineCount }) {
  const getStatus = (min) => {
    if (!min) return { label: 'Sin datos', cls: 'badge-yellow' }
    if (min < 8.0) return { label: 'Crítico', cls: 'badge-red' }
    if (min < 9.0) return { label: 'Vigilancia', cls: 'badge-yellow' }
    return { label: 'Aceptado', cls: 'badge-green' }
  }

  const getColor = (val, low = 8, warn = 9) => {
    if (!val) return 'var(--text-dim)'
    if (val < low) return 'var(--red)'
    if (val < warn) return 'var(--yellow)'
    return 'var(--green)'
  }

  const status = getStatus(minThickness)
  const pct = minThickness ? Math.min(100, Math.round((minThickness / 12) * 100)) : 0

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
            {station.code}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>
            {station.name}
          </div>
          {inspection && (
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 2 }}>
              {new Date(inspection.inspection_date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
              {' · '}{inspection.report_number}
            </div>
          )}
        </div>
        <span className={`badge ${status.cls}`}>{status.label}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>Mín global</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1, color: getColor(minThickness) }}>
            {minThickness ? minThickness.toFixed(2) : '—'}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>mm</div>
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>Promedio</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1, color: 'var(--accent)' }}>
            {avgThickness ? avgThickness.toFixed(2) : '—'}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>mm</div>
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>Líneas</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1, color: '#fff' }}>
            {lineCount ?? '—'}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>inspeccionadas</div>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 2,
            width: `${pct}%`,
            background: minThickness < 8 ? 'var(--red)' : minThickness < 9 ? 'var(--yellow)' : 'var(--green)',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: 4 }}>
          Inspector: {inspection?.inspector || '—'}
        </div>
      </div>
    </div>
  )
}
