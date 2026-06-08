import { type FormEvent, useEffect, useMemo, useState } from 'react'
import ExpenseList from './ExpenseList'
import ExpensePieChart from './ExpensePieChart'
import SummaryCards from './SummaryCards'
import type { Expense } from './types'

type FormState = {
  title: string
  amount: string
  category: string
  date: string
  notes: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const storageKey = 'expense-tracker:expenses'
const categories = [
  'Food',
  'Transport',
  'Utilities',
  'Shopping',
  'Healthcare',
  'Subscriptions',
  'Other',
]

const defaultForm: FormState = {
  title: '',
  amount: '',
  category: '',
  date: '',
  notes: '',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

export default function App() {
  const [form, setForm] = useState<FormState>(defaultForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = window.localStorage.getItem(storageKey)
      return raw ? (JSON.parse(raw) as Expense[]) : []
    } catch {
      return []
    }
  })
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)
  const [showSaved, setShowSaved] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(expenses))
    } catch (error) {
      console.error('Failed to save expenses to localStorage:', error instanceof Error ? error.message : String(error))
    }
  }, [expenses])

  useEffect(() => {
    if (!showSaved) return
    const timer = window.setTimeout(() => setShowSaved(false), 2500)
    return () => window.clearTimeout(timer)
  }, [showSaved])

  const totals = useMemo(
    () => ({
      count: expenses.length,
      total: expenses.reduce((sum, item) => sum + item.amount, 0),
    }),
    [expenses],
  )

  const sortedExpenses = useMemo(
    () => [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [expenses],
  )

  const availableCategories = useMemo(
    () => Array.from(new Set(expenses.map((expense) => expense.category))).sort(),
    [expenses],
  )

  const filteredExpenses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return sortedExpenses.filter((expense) => {
      const categoryMatches = filterCategory ? expense.category === filterCategory : true
      const titleMatches = expense.title.toLowerCase().includes(query)
      return categoryMatches && titleMatches
    })
  }, [sortedExpenses, filterCategory, searchQuery])

  const hasFilters = Boolean(filterCategory || searchQuery.trim())
  const emptyListMessage = hasFilters ? 'No expenses match your filters.' : undefined
  const isEditing = Boolean(editingExpenseId)

  const handleInput = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  const validate = () => {
    const next: FormErrors = {}

    if (!form.title.trim()) next.title = 'Title is required.'
    if (!form.amount.trim()) {
      next.amount = 'Amount is required.'
    } else if (Number(form.amount) < 0 || Number.isNaN(Number(form.amount))) {
      next.amount = 'Amount cannot be negative.'
    }
    if (!form.category) next.category = 'Category is required.'
    if (!form.date) next.date = 'Date is required.'
    return next
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate()

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const updatedExpense: Expense = {
      id: editingExpenseId ?? Date.now().toString(),
      title: form.title.trim(),
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      notes: form.notes.trim(),
    }

    setExpenses((current) => {
      if (editingExpenseId) {
        return current.map((expense) => (expense.id === editingExpenseId ? updatedExpense : expense))
      }
      return [updatedExpense, ...current]
    })

    setForm(defaultForm)
    setErrors({})
    setEditingExpenseId(null)
    setPendingDeleteId(null)
    setShowSaved(true)
  }

  const handleEdit = (expense: Expense) => {
    setForm({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
      notes: expense.notes,
    })
    setEditingExpenseId(expense.id)
    setErrors({})
    setPendingDeleteId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setForm(defaultForm)
    setErrors({})
    setEditingExpenseId(null)
  }

  const requestDelete = (id: string) => {
    setPendingDeleteId(id)
  }

  const cancelDelete = () => {
    setPendingDeleteId(null)
  }

  const confirmDelete = (id: string) => {
    setExpenses((current) => current.filter((item) => item.id !== id))
    if (editingExpenseId === id) {
      setEditingExpenseId(null)
      setForm(defaultForm)
      setErrors({})
    }
    setPendingDeleteId(null)
  }

  const clearFilters = () => {
    setFilterCategory('')
    setSearchQuery('')
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-2xl border border-white/10 bg-slate-950/80 p-8 shadow-xl shadow-slate-950/20">
          <div className="grid gap-8 xl:grid-cols-[1.3fr_0.7fr] items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-cyan-300/80">Expense tracker</p>
              <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Manage your monthly spending</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Add expenses, validate every entry, and keep the list in local storage so your data persists across refreshes.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.32em] text-cyan-300/80">Saved expenses</p>
              <p className="mt-4 text-3xl font-semibold text-white">{totals.count}</p>
              <p className="mt-2 text-sm text-slate-400">Total {formatCurrency(totals.total)}</p>
            </div>
          </div>
        </section>

        <SummaryCards expenses={expenses} />

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <section className={`rounded-2xl border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/20 ${isEditing ? 'ring-2 ring-amber-400/40' : ''}`}>
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.32em] text-cyan-300/80">{isEditing ? 'Editing' : 'Add new'} expense</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">{isEditing ? 'Edit expense' : 'Add new expense'}</h2>
              <p className="mt-3 text-sm text-slate-400">Every field is designed to keep the form clean and easy to scan.</p>
            </div>

            <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  <span className="flex items-center justify-between gap-2 font-medium text-white">
                    Title <span className="text-xs text-slate-500">required</span>
                  </span>
                  <input
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    value={form.title}
                    onChange={(event) => handleInput('title', event.target.value)}
                    placeholder="e.g. Groceries"
                    aria-invalid={Boolean(errors.title)}
                  />
                  {errors.title ? <p className="text-xs text-rose-400">{errors.title}</p> : null}
                </label>

                <label className="space-y-2 text-sm text-slate-300">
                  <span className="flex items-center justify-between gap-2 font-medium text-white">
                    Amount <span className="text-xs text-slate-500">required</span>
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    value={form.amount}
                    onChange={(event) => handleInput('amount', event.target.value)}
                    placeholder="0.00"
                    aria-invalid={Boolean(errors.amount)}
                  />
                  {errors.amount ? <p className="text-xs text-rose-400">{errors.amount}</p> : null}
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  <span className="flex items-center justify-between gap-2 font-medium text-white">
                    Category <span className="text-xs text-slate-500">required</span>
                  </span>
                  <select
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    value={form.category}
                    onChange={(event) => handleInput('category', event.target.value)}
                    aria-invalid={Boolean(errors.category)}
                  >
                    <option value="">Choose a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category ? <p className="text-xs text-rose-400">{errors.category}</p> : null}
                </label>

                <label className="space-y-2 text-sm text-slate-300">
                  <span className="flex items-center justify-between gap-2 font-medium text-white">
                    Date <span className="text-xs text-slate-500">required</span>
                  </span>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    value={form.date}
                    onChange={(event) => handleInput('date', event.target.value)}
                    aria-invalid={Boolean(errors.date)}
                  />
                  {errors.date ? <p className="text-xs text-rose-400">{errors.date}</p> : null}
                </label>
              </div>

              <label className="space-y-2 text-sm text-slate-300">
                <span className="font-medium text-white">Notes</span>
                <textarea
                  className="min-h-[120px] w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  value={form.notes}
                  onChange={(event) => handleInput('notes', event.target.value)}
                  placeholder="Optional details"
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-400">All required fields must be completed before saving.</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="inline-flex min-w-[120px] items-center justify-center rounded-full border border-slate-700 bg-slate-900/90 px-6 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 hover:border-slate-500 hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                  ) : null}
                  <button
                    type="submit"
                    className={`inline-flex min-w-[120px] items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-slate-950 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400/40 ${
                      isEditing ? 'bg-amber-400 hover:bg-amber-300' : 'bg-cyan-400 hover:bg-cyan-300'
                    }`}
                  >
                    {isEditing ? 'Update expense' : 'Save expense'}
                  </button>
                </div>
              </div>
            </form>
          </section>

          <ExpensePieChart expenses={expenses} />
        </div>

        <section className="rounded-2xl border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/20" onClick={cancelDelete}>
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-300/80">Recent activity</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Expense list</h2>
            <p className="mt-3 text-sm text-slate-400">Filter and review your tracked expenses.</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_auto] items-end">
            <label className="space-y-2 text-sm text-slate-300">
              <span className="font-medium text-white">Category</span>
              <select
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                value={filterCategory}
                onChange={(event) => setFilterCategory(event.target.value)}
              >
                <option value="">All categories</option>
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm text-slate-300">
              <span className="font-medium text-white">Search</span>
              <input
                type="search"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by title"
              />
            </label>

            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex min-w-[120px] items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:border-cyan-500 hover:bg-slate-900"
              >
                Clear filters
              </button>
            ) : (
              <div />
            )}
          </div>

          <div className="mt-6">
            <ExpenseList
              expenses={filteredExpenses}
              onEdit={handleEdit}
              onRequestDelete={requestDelete}
              onConfirmDelete={confirmDelete}
              onCancelDelete={cancelDelete}
              pendingDeleteId={pendingDeleteId}
              emptyMessage={emptyListMessage}
            />
          </div>
        </section>
      </div>

      <div
        className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-opacity duration-300"
        style={{ opacity: showSaved ? 1 : 0, pointerEvents: 'none' }}
      >
        Expense saved ✓
      </div>
    </main>
  )
}
