import { Line } from 'react-chartjs-2'

const STATION_COLORS = {
  PS1: '#2f81f7',
  PS2: '#f85149',
  VS2: '#3fb950',
}

export default function TrendLineChart({ trendData }) {
  if (!trendData || trendData.length === 0) {
    return (
      <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
        Se necesitan al menos 2 inspecciones para mostrar tendencia
      </div>
    )
  }

  const datasets = trendData.map(({ station, points }) => ({
    label: station,
    data: points.map(p => ({ x: p.date, y: p.minThickness })),
    borderColor: STATION_COLORS[station] || '#2f81f7',
    backgroundColor: `${STATION_COLORS[station] || '#2f81f7'}22`,
    pointBackgroundColor: STATION_COLORS[station] || '#2f81f7',
    tension: 0.3,
    fill: false,
    pointRadius: 5,
    borderWidth: 2,
  }))

  const chartData = { datasets }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'category',
        ticks: { color: '#7d8590', font: { size: 10 } },
        grid: { color: 'rgba(48,54,61,0.5)' },
      },
      y: {
        beginAtZero: false,
        ticks: {
          color: '#7d8590',
          callback: v => `${v} mm`,
          font: { size: 10 },
        },
        grid: { color: 'rgba(48,54,61,0.5)' },
        title: { display: true, text: 'Espesor mínimo (mm)', color: '#7d8590', font: { size: 10 } },
      },
    },
    plugins: {
      legend: { labels: { color: '#e6edf3', font: { size: 11 } } },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y?.toFixed(2)} mm`,
        },
      },
    },
  }

  return (
    <div style={{ height: 260, position: 'relative' }}>
      <Line data={chartData} options={options} />
    </div>
  )
}
