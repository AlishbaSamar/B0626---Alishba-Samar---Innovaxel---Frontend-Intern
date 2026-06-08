import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js'
import { Pie } from 'react-chartjs-2'
import type { Expense } from './types'

ChartJS.register(ArcElement, Tooltip, Legend)

type ExpensePieChartProps = {
  expenses: Expense[]
}

const colors = [
  '#22c55e',
  '#38bdf8',
  '#f97316',
  '#f43f5e',
  '#a855f7',
  '#facc15',
  '#22d3ee',
  '#fb7185',
  '#8b5cf6',
  '#fb923c',
]

const options: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#cbd5e1',
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label ?? ''
          const value = context.parsed as number
          return `${label}: $${value.toFixed(2)}`
        },
      },
    },
  },
}

const groupByCategory = (expenses: Expense[]) =>
  expenses.reduce<Record<string, number>>((acc, expense) => {
    acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount
    return acc
  }, {})

export default function ExpensePieChart({ expenses }: ExpensePieChartProps) {
  const categoryTotals = groupByCategory(expenses)
  const categoryEntries = Object.entries(categoryTotals).filter(([, total]) => total > 0)

  if (categoryEntries.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-8 text-center text-slate-400 shadow-xl shadow-slate-950/10">
        <p className="text-lg font-semibold text-white">No data available</p>
        <p className="mt-2 text-sm text-slate-400">Add expenses to display the spending distribution.</p>
      </div>
    )
  }

  const categories = categoryEntries.map(([category]) => category)
  const values = categoryEntries.map(([, total]) => total)

  const data = {
    labels: categories,
    datasets: [
      {
        data: values,
        backgroundColor: categories.map((_, index) => colors[index % colors.length]),
        borderColor: 'rgba(15, 23, 42, 0.85)',
        borderWidth: 2,
      },
    ],
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/20 backdrop-blur-xl sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-cyan-300/80">Spending distribution</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Expense categories</h2>
        </div>
        <p className="text-sm text-slate-400">Visual breakdown by category total.</p>
      </div>

      <div className="flex min-h-[280px] max-h-[380px] aspect-square items-center justify-center rounded-2xl bg-slate-900/80 p-4 mx-auto">
        <div className="w-full h-full">
          <Pie data={data} options={options} />
        </div>
      </div>
    </section>
  )
}
