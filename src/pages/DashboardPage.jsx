import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import StationCard from '../components/StationCard'
import WearRadarChart from '../components/WearRadarChart'
import TrendLineChart from '../components/TrendLineChart'
import MeasurementsTable from '../components/MeasurementsTable'
import AddMeasurementModal from '../components/AddMeasurementModal'

export default function DashboardPage({ session }) {
  const [stations, setStations] = useState([])
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedStation, setSelectedStation] = useState(null)

  const fetchData = async () => {
    setLoading(true)

    const { data: stns } = await supabase
      .from('stations')
      .select('*')
      .order('code')

    if (!stns) { setLoading(false); return }
    setStations(stns)

    const result = {}

    for (const stn of stns) {
      const { data: inspections } = await supabase
        .from('inspections')
        .select('*')
        .eq('station_id', stn.id)
        .order('inspection_date', { ascending: false })

      if (!inspections?.length) { result[stn.id] = { inspections: [], measurements: [] }; continue }

      const latestInspection = inspections[0]

      const { data: pipelines } = await supabase
        .from('pipe_lines')
        .select('*, measurements(*)')
        .eq('inspection_id', latestInspection.id)

      const allMeasurements = (pipelines || []).flatMap(pl =>
        (pl.measurements || []).map(m => ({ ...m, pipe_lines: pl }))
      )

      const trendPoints = await Promise.all(
        inspections.map(async (insp) => {
          const { data: pls } = await supabase
            .from('pipe_lines')
            .select('measurements(thickness_mm)')
            .eq('inspection_id', insp.id)

          const vals = (pls || []).flatMap(pl => (pl.measurements || []).map(m => Number(m.thickness_mm)))
          return {
            date: insp.inspection_date,
            minThickness: vals.length ? Math.min(...vals) : null,
          }
        })
      )

      result[stn.id] = {
        inspections,
        latestInspection,
        pipelines: pipelines || [],
        measurements: allMeasurements,
        trendPoints: trendPoints.filter(p => p.minThickness !== null).reverse(),
      }
    }

    setData(result)
    setSelectedStation(stns[0]?.id || null)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const getStats = (stationId) => {
    const d = data[stationId]
    if (!d?.measurements?.length) return {}
    const vals = d.measurements.map(m => Number(m.thickness_mm))
    return {
      minThickness: Math.min(...vals),
      avgThickness: vals.reduce((a, b) => a + b, 0) / vals.length,
    }
  }

  const trendData = stations.map(stn => ({
    station: stn.code,
    points: data[stn.id]?.trendPoints || [],
  })).filter(t => t.points.length > 0)

  const STATION_COLORS = { PS1: '#2f81f7', PS2: '#f85149', VS2: '#3fb950' }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header session={session} onAddMeasurement={() => setShowModal(true)} />

      <main style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
            <div className="spinner" />
            <span style={{ color: 'var(--text-dim)' }}>Cargando datos…</span>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <p className="section-label">Resumen por Estación</p>
            <div className="grid-3" style={{ marginBottom: 28 }}>
              {stations.map(stn => {
                const stats = getStats(stn.id)
                const d = data[stn.id]
                return (
                  <div key={stn.id} onClick={() => setSelectedStation(stn.id)} style={{ cursor: 'pointer' }}>
                    <StationCard
                      station={stn}
                      inspection={d?.latestInspection}
                      minThickness={stats.minThickness}
                      avgThickness={stats.avgThickness}
                      lineCount={d?.pipelines?.length}
                    />
                  </div>
                )
              })}
            </div>

            {/* Radar Charts */}
            <p className="section-label">Distribución Angular del Desgaste</p>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginBottom: 14 }}>
              Espesor mínimo (mm) por posición angular. La depresión en el polígono indica la zona de mayor desgaste.
            </p>
            <div className="grid-3" style={{ marginBottom: 28 }}>
              {stations.map(stn => {
                const d = data[stn.id]
                const color = STATION_COLORS[stn.code] || '#2f81f7'
                const allVals = (d?.measurements || []).map(m => Number(m.thickness_mm))
                const minVal = allVals.length ? Math.min(...allVals) : 6
                const maxVal = allVals.length ? Math.max(...allVals) : 20
                const margin = Math.ceil((maxVal - minVal) * 0.15)

                return (
                  <div key={stn.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{stn.code}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        {d?.latestInspection
                          ? new Date(d.latestInspection.inspection_date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
                          : 'Sin datos'}
                      </span>
                    </div>
                    <WearRadarChart
                      measurements={d?.measurements || []}
                      label={`${stn.code} — Mín (mm)`}
                      color={color}
                      minScale={Math.max(0, minVal - margin)}
                      maxScale={maxVal + margin}
                    />
                    {d?.measurements?.length > 0 && (
                      <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 8 }}>
                        {d.measurements.length} lecturas · Mín: <span style={{ color: color }}>{Math.min(...allVals).toFixed(2)} mm</span>
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Trend + Table */}
            <div className="grid-2" style={{ marginBottom: 28 }}>
              <div className="card">
                <p className="section-label" style={{ marginBottom: 12 }}>Tendencia de Espesores Mínimos</p>
                <TrendLineChart trendData={trendData} />
                {trendData.every(t => t.points.length < 2) && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 8 }}>
                    La tendencia real aparecerá automáticamente al registrar más inspecciones (cada 4 meses).
                  </p>
                )}
              </div>

              <div className="card">
                <p className="section-label" style={{ marginBottom: 12 }}>Comparación de Mínimos por Estación</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                  {stations.map(stn => {
                    const { minThickness, avgThickness } = getStats(stn.id)
                    const color = STATION_COLORS[stn.code] || '#2f81f7'
                    const pct = minThickness ? Math.min(100, (minThickness / 20) * 100) : 0
                    return (
                      <div key={stn.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, color }}>{stn.code}</span>
                          <span style={{ color: minThickness < 8 ? 'var(--red)' : minThickness < 9 ? 'var(--yellow)' : 'var(--green)', fontWeight: 600, fontSize: '0.85rem' }}>
                            {minThickness ? `${minThickness.toFixed(2)} mm` : '—'}
                          </span>
                        </div>
                        <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: 2 }}>
                          Promedio: {avgThickness ? `${avgThickness.toFixed(2)} mm` : '—'}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ marginTop: 20, padding: '12px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                    <span style={{ color: 'var(--red)', fontWeight: 600 }}>● Crítico</span> &lt; 8.0 mm &nbsp;|&nbsp;
                    <span style={{ color: 'var(--yellow)', fontWeight: 600 }}>● Vigilancia</span> &lt; 9.0 mm &nbsp;|&nbsp;
                    <span style={{ color: 'var(--green)', fontWeight: 600 }}>● Aceptado</span> ≥ 9.0 mm<br />
                    Reinspección recomendada: cada <strong>4 meses</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Detail Table */}
            {selectedStation && data[selectedStation] && (
              <div className="card">
                <p className="section-label" style={{ marginBottom: 16 }}>
                  Detalle de Líneas — {stations.find(s => s.id === selectedStation)?.code}
                  <span style={{ marginLeft: 8, display: 'flex', gap: 6 }}>
                    {stations.map(stn => (
                      <button
                        key={stn.id}
                        className={`btn ${selectedStation === stn.id ? 'btn-primary' : ''}`}
                        style={{ padding: '3px 10px', fontSize: '0.72rem' }}
                        onClick={e => { e.stopPropagation(); setSelectedStation(stn.id) }}
                      >
                        {stn.code}
                      </button>
                    ))}
                  </span>
                </p>
                <MeasurementsTable pipelines={data[selectedStation]?.pipelines || []} />
              </div>
            )}
          </>
        )}
      </main>

      {showModal && (
        <AddMeasurementModal
          stations={stations}
          onClose={() => setShowModal(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  )
}
