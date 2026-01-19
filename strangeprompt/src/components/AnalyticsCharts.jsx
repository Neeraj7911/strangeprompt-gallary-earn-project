import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { estimateEarnings } from '../utils/format'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend)

const baseChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      labels: {
        color: '#ff9ea6',
        font: { family: 'Inter' },
      },
    },
    tooltip: {
      backgroundColor: '#140d15',
      titleColor: '#ffe8ea',
      bodyColor: '#ff9ea6',
      borderColor: '#4b0105',
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      ticks: { color: '#ff9ea6' },
      grid: { color: 'rgba(75, 1, 5, 0.35)' },
    },
    y: {
      ticks: { color: '#ff9ea6' },
      grid: { color: 'rgba(75, 1, 5, 0.35)' },
    },
  },
}

export default function AnalyticsCharts({ uploads }) {
  const likesOverTime = useMemo(() => {
    const sorted = [...uploads].sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
    return {
      labels: sorted.map((item) =>
        item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Pending',
      ),
      datasets: [
        {
          label: 'Total likes',
          data: sorted.map((item) => item.likes || 0),
          borderColor: '#e50914',
          backgroundColor: 'rgba(229, 9, 20, 0.35)',
          fill: true,
          tension: 0.3,
        },
      ],
    }
  }, [uploads])

  const topPerformers = useMemo(() => {
    const sorted = [...uploads]
      .sort((a, b) => (b.likes || 0) + (b.views || 0) - ((a.likes || 0) + (a.views || 0)))
      .slice(0, 5)

    return {
      labels: sorted.map((item) => item.prompt.slice(0, 20)),
      datasets: [
        {
          label: 'Engagement score',
          data: sorted.map((item) => (item.likes || 0) + (item.views || 0) * 0.1 + (item.copies || 0) * 2),
          backgroundColor: 'rgba(196, 8, 17, 0.6)',
        },
      ],
    }
  }, [uploads])

  const earningsData = useMemo(() => {
    const totalEarnings = uploads.map((item) => estimateEarnings({ views: item.views, copies: item.copies, shares: item.shares }))
    return {
      total: totalEarnings.reduce((sum, value) => sum + value, 0),
      perUpload: totalEarnings,
    }
  }, [uploads])

  return (
    <div className="grid gap-6 text-brand-200/80 lg:grid-cols-2">
      <div className="rounded-3xl bg-[#18101c]/85 p-6 shadow-[0_34px_92px_-54px_rgba(229,9,20,0.62)]">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-200/70">Likes over time</h3>
        <Line data={likesOverTime} options={baseChartOptions} height={220} />
      </div>
      <div className="rounded-3xl bg-[#18101c]/85 p-6 shadow-[0_34px_92px_-54px_rgba(229,9,20,0.62)]">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-200/70">Top performing uploads</h3>
        <Bar data={topPerformers} options={baseChartOptions} height={220} />
      </div>
      <div className="rounded-3xl bg-[#140d15]/85 p-6 shadow-[0_36px_96px_-52px_rgba(229,9,20,0.7)] lg:col-span-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-200/70">Earnings simulation</h3>
        <p className="mt-4 text-3xl font-bold text-brand-50">${earningsData.total.toFixed(2)}</p>
        <p className="text-xs text-brand-200/65">Based on redirect engagement and community metrics</p>
      </div>
    </div>
  )
}
