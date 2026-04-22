import { Radar } from 'react-chartjs-2'

const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]
const LABELS = ANGLES.map(a => `${a}°`)

export function computeRadarData(measurements, elementType = null) {
  const buckets = {}
  ANGLES.forEach(a => { buckets[a] = [] })

  measurements.forEach(m => {
    if (elementType && m.pipe_lines?.element_type !== elementType) return
    if (ANGLES.includes(m.angle_degrees)) {
      buckets[m.angle_degrees].push(Number(m.thickness_mm))
    }
  })

  return ANGLES.map(a => {
    const vals = buckets[a]
    return vals.length ? Math.min(...vals) : null
  })
}

export default function WearRadarChart({ measurements, label, color = '#2f81f7', elementType = null, minScale = 6, maxScale = 16 }) {
  const data = computeRadarData(measurements, elementType)
  const hasData = data.some(v => v !== null)

  const chartData = {
    labels: LABELS,
    datasets: [{
      label: label || 'Espesor mín (mm)',
      data,
      borderColor: color,
      backgroundColor: `${color}22`,
      pointBackgroundColor: data.map(v => {
        if (v === null) return 'transparent'
        if (v < 8) return '#f85149'
        if (v < 9) return '#d29922'
        return color
      }),
      pointRadius: 4,
      borderWidth: 2,
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: false,
        min: minScale,
        max: maxScale,
        ticks: {
          color: '#7d8590',
          font: { size: 9 },
          stepSize: 2,
          backdropColor: 'transparent',
        },
        grid: { color: 'rgba(48,54,61,0.7)' },
        angleLines: { color: 'rgba(48,54,61,0.7)' },
        pointLabels: { color: '#e6edf3', font: { size: 10 } },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ctx.raw !== null ? `${ctx.raw.toFixed(2)} mm` : 'Sin dato',
        },
      },
    },
  }

  if (!hasData) {
    return (
      <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
        Sin mediciones registradas
      </div>
    )
  }

  return (
    <div style={{ height: 260, position: 'relative' }}>
      <Radar data={chartData} options={options} />
    </div>
  )
}
