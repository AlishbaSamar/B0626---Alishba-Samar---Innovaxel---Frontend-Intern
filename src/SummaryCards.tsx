import type { Expense } from './types'

type SummaryCardsProps = {
  expenses: Expense[]
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)

const highestSpendingCategory = (expenses: Expense[]) => {
  if (expenses.length === 0) return 'No expenses yet'

  const totalsByCategory = expenses.reduce<Record<string, number>>((acc, expense) => {
    acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount
    return acc
  }, {})

  return Object.entries(totalsByCategory).reduce((best, current) => {
    const [category, total] = current
    return total > best[1] ? [category, total] : best
  }, ['', 0])[0] || 'No expenses yet'
}

export default function SummaryCards({ expenses }: SummaryCardsProps) {
  const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalTransactions = expenses.length
  const topCategory = highestSpendingCategory(expenses)

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article className="rounded-2xl border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/20 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-cyan-500/20">
        <p className="text-sm uppercase tracking-[0.32em] text-cyan-300/80">Total spending</p>
        <h2 className="mt-4 text-3xl font-semibold text-white">{formatCurrency(totalSpending)}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">All expenses combined for the current list.</p>
      </article>

      <article className="rounded-2xl border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/20 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-cyan-500/20">
        <p className="text-sm uppercase tracking-[0.32em] text-cyan-300/80">Total transactions</p>
        <h2 className="mt-4 text-3xl font-semibold text-white">{totalTransactions}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">Number of expense records currently tracked.</p>
      </article>

      <article className="rounded-2xl border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/20 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-cyan-500/20">
        <p className="text-sm uppercase tracking-[0.32em] text-cyan-300/80">Highest spending category</p>
        <h2 className="mt-4 text-3xl font-semibold text-white">{topCategory}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">Category with the largest cumulative expense total.</p>
      </article>
    </section>
  )
}
