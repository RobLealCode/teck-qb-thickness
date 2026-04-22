import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]
const ELEMENT_TYPES = [
  { value: 'STRAIGHT', label: 'Tramo Recto' },
  { value: 'ELBOW_90', label: 'Codo 90°' },
  { value: 'TEE', label: 'Tee' },
  { value: 'REDUCER', label: 'Reductor' },
  { value: 'LAUNCHER', label: 'Trampa Pig' },
]

export default function AddMeasurementModal({ stations, onClose, onSuccess }) {
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [existingInspections, setExistingInspections] = useState([])

  const [form, setForm] = useState({
    station_id: stations?.[0]?.id || '',
    inspection_mode: 'new',
    inspection_id: '',
    report_number: '',
    inspector: '',
    inspection_date: new Date().toISOString().split('T')[0],
    tag: '',
    diameter_inches: '',
    element_type: 'STRAIGHT',
    ring_number: 'A1',
    thicknesses: Object.fromEntries(ANGLES.map(a => [a, ''])),
    notes: '',
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  useEffect(() => {
    if (!form.station_id) return
    supabase
      .from('inspections')
      .select('id, report_number, inspection_date, inspector')
      .eq('station_id', form.station_id)
      .order('inspection_date', { ascending: false })
      .then(({ data }) => setExistingInspections(data || []))
  }, [form.station_id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      let inspectionId = form.inspection_id

      if (form.inspection_mode === 'new') {
        const { data, error } = await supabase
          .from('inspections')
          .insert({
            station_id: form.station_id,
            report_number: form.report_number,
            inspector: form.inspector,
            inspection_date: form.inspection_date,
            result: 'ACEPTADO',
          })
          .select()
          .single()
        if (error) throw error
        inspectionId = data.id
      }

      const { data: pl, error: plErr } = await supabase
        .from('pipe_lines')
        .insert({
          inspection_id: inspectionId,
          tag: form.tag,
          diameter_inches: form.diameter_inches,
          element_type: form.element_type,
        })
        .select()
        .single()
      if (plErr) throw plErr

      const measurements = ANGLES
        .filter(a => form.thicknesses[a] !== '' && !isNaN(form.thicknesses[a]))
        .map(a => ({
          pipe_line_id: pl.id,
          ring_number: form.ring_number,
          angle_degrees: a,
          thickness_mm: parseFloat(form.thicknesses[a]),
          measured_at: form.inspection_date,
          notes: form.notes || null,
        }))

      if (measurements.length === 0) throw new Error('Ingresa al menos un valor de espesor.')

      const { error: mErr } = await supabase.from('measurements').insert(measurements)
      if (mErr) throw mErr

      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>Nueva Medición de Espesor</h2>
          <button className="btn" onClick={onClose} style={{ padding: '4px 8px' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <div className="form-group">
                <label>Estación</label>
                <select className="input" value={form.station_id} onChange={e => set('station_id', e.target.value)}>
                  {stations.map(s => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Inspección</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  {['new', 'existing'].map(mode => (
                    <button key={mode} type="button" className={`btn ${form.inspection_mode === mode ? 'btn-primary' : ''}`}
                      onClick={() => set('inspection_mode', mode)}>
                      {mode === 'new' ? 'Nueva' : 'Existente'}
                    </button>
                  ))}
                </div>
              </div>

              {form.inspection_mode === 'new' ? (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Fecha</label>
                      <input className="input" type="date" value={form.inspection_date}
                        onChange={e => set('inspection_date', e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>N° Informe</label>
                      <input className="input" type="text" value={form.report_number}
                        onChange={e => set('report_number', e.target.value)} placeholder="PyC-UT-QB-0000" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Inspector</label>
                    <input className="input" type="text" value={form.inspector}
                      onChange={e => set('inspector', e.target.value)} placeholder="Nombre del inspector" />
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label>Seleccionar Inspección</label>
                  <select className="input" value={form.inspection_id} onChange={e => set('inspection_id', e.target.value)} required>
                    <option value="">— Selecciona —</option>
                    {existingInspections.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.inspection_date} · {i.report_number || 'Sin número'} · {i.inspector}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button type="button" className="btn" onClick={onClose}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>Siguiente →</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>TAG de la Línea</label>
                  <input className="input" type="text" value={form.tag}
                    onChange={e => set('tag', e.target.value)} placeholder="0651-SW-A1-20''-1003" required />
                </div>
                <div className="form-group">
                  <label>Diámetro (pulg)</label>
                  <input className="input" type="text" value={form.diameter_inches}
                    onChange={e => set('diameter_inches', e.target.value)} placeholder='20' required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Elemento</label>
                  <select className="input" value={form.element_type} onChange={e => set('element_type', e.target.value)}>
                    {ELEMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>N° de Anillo</label>
                  <input className="input" type="text" value={form.ring_number}
                    onChange={e => set('ring_number', e.target.value)} placeholder="A1" required />
                </div>
              </div>

              <div className="form-group">
                <label>Espesores por posición angular (mm)</label>
                <div className="angles-grid">
                  {ANGLES.map(a => (
                    <div key={a}>
                      <label style={{ fontSize: '0.7rem', marginBottom: 3 }}>{a}°</label>
                      <input
                        className="input"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={form.thicknesses[a]}
                        onChange={e => set('thicknesses', { ...form.thicknesses, [a]: e.target.value })}
                        placeholder="—"
                        style={{ textAlign: 'center' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Notas</label>
                <input className="input" type="text" value={form.notes}
                  onChange={e => set('notes', e.target.value)} placeholder="Observaciones opcionales" />
              </div>

              {error && <p style={{ color: 'var(--red)', fontSize: '0.8rem', marginBottom: 8 }}>{error}</p>}

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
                <button type="button" className="btn" onClick={() => setStep(1)}>← Atrás</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : 'Guardar Medición'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
