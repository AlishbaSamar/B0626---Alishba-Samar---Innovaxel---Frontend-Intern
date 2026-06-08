import type { Expense } from './types'

type ExpenseListProps = {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onRequestDelete: (id: string) => void
  onConfirmDelete: (id: string) => void
  onCancelDelete: () => void
  pendingDeleteId: string | null
  emptyMessage?: string
}

const formattedDate = (date: string) => {
  const parsed = new Date(date)
  return isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)

export default function ExpenseList({
  expenses,
  onEdit,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  pendingDeleteId,
  emptyMessage,
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-8 text-center text-sm text-slate-400">
        {emptyMessage ?? 'No expenses added yet. Add your first record to see it here.'}
      </div>
    )
  }

  return (
    <div className="space-y-4" onClick={onCancelDelete}>
      {expenses.map((expense) => (
        <div key={expense.id} className="space-y-3">
          <article
            className="rounded-2xl border border-slate-800/80 border-l-4 border-cyan-500/40 bg-slate-900/70 p-5 shadow-sm shadow-slate-950/10 transition-all duration-200 hover:border-cyan-500/60"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="lg:hidden">
              <p className="text-lg font-semibold text-white">{expense.title}</p>
              <p className="mt-2 text-xl font-semibold text-cyan-300">{formatCurrency(expense.amount)}</p>
              <p className="mt-3 text-sm text-slate-400">{expense.category} · {formattedDate(expense.date)}</p>
            </div>

            <div className="hidden lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_280px] lg:items-center lg:gap-4">
              <p className="text-lg font-semibold text-white">{expense.title}</p>
              <p className="text-right text-xl font-semibold text-cyan-300">{formatCurrency(expense.amount)}</p>
              <p className="text-right text-sm text-slate-400">{expense.category}</p>
              <p className="text-right text-sm text-slate-500">{formattedDate(expense.date)}</p>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  className="min-w-[110px] rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition-all duration-200 hover:bg-cyan-500/20"
                  onClick={(event) => {
                    event.stopPropagation()
                    onEdit(expense)
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="min-w-[110px] rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition-all duration-200 hover:bg-rose-500/20"
                  onClick={(event) => {
                    event.stopPropagation()
                    onRequestDelete(expense.id)
                  }}
                >
                  Delete
                </button>
              </div>
            </div>

            {expense.notes ? (
              <p className="mt-3 text-sm italic text-slate-400 truncate">{expense.notes}</p>
            ) : null}

            <div className="mt-4 flex flex-col gap-2 lg:hidden">
              <button
                type="button"
                className="w-full rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition-all duration-200 hover:bg-cyan-500/20"
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit(expense)
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="w-full rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition-all duration-200 hover:bg-rose-500/20"
                onClick={(event) => {
                  event.stopPropagation()
                  onRequestDelete(expense.id)
                }}
              >
                Delete
              </button>
            </div>
          </article>

          {pendingDeleteId === expense.id ? (
            <div
              className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100 shadow-sm shadow-rose-950/10 transition-all duration-200"
              onClick={(event) => event.stopPropagation()}
            >
              <p>Delete {expense.title}? This cannot be undone.</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="min-w-[120px] rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-rose-400"
                  onClick={() => onConfirmDelete(expense.id)}
                >
                  Confirm Delete
                </button>
                <button
                  type="button"
                  className="min-w-[120px] rounded-full border border-rose-500/20 bg-transparent px-4 py-2 text-sm font-semibold text-rose-200 transition-all duration-200 hover:bg-rose-500/10"
                  onClick={(event) => {
                    event.stopPropagation()
                    onCancelDelete()
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}
