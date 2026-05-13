'use client'

import { useEffect, useState } from 'react'
import { supabase, AccountingEntry } from '@/lib/supabase'
import { Plus, TrendingUp, TrendingDown, DollarSign, X, Check, Trash2 } from 'lucide-react'

const CATEGORIES_INGRESO = ['ventas', 'otro ingreso']
const CATEGORIES_EGRESO = ['insumos', 'transporte', 'servicios', 'arriendo', 'salarios', 'otro egreso']

const empty = { type: 'ingreso' as 'ingreso' | 'egreso', category: 'ventas', description: '', amount: '', entry_date: new Date().toISOString().slice(0, 10) }

function fmtCOP(n: number) { return `$${n.toLocaleString('es-CO')}` }

export default function AccountingPage() {
  const [entries, setEntries] = useState<AccountingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7))

  const load = async () => {
    const startDate = `${filterMonth}-01`
    const endDate = `${filterMonth}-31`
    const { data } = await supabase
      .from('accounting_entries')
      .select('*')
      .gte('entry_date', startDate)
      .lte('entry_date', endDate)
      .order('entry_date', { ascending: false })
    setEntries(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filterMonth])

  const totalIngresos = entries.filter((e) => e.type === 'ingreso').reduce((s, e) => s + e.amount, 0)
  const totalEgresos = entries.filter((e) => e.type === 'egreso').reduce((s, e) => s + e.amount, 0)
  const utilidad = totalIngresos - totalEgresos

  const openModal = () => { setForm(empty); setModal(true) }
  const closeModal = () => setModal(false)

  const save = async () => {
    if (!form.description || !form.amount) return
    setSaving(true)
    await supabase.from('accounting_entries').insert({
      type: form.type,
      category: form.category,
      description: form.description,
      amount: parseFloat(form.amount),
      entry_date: form.entry_date,
    })
    setSaving(false)
    closeModal()
    load()
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    await supabase.from('accounting_entries').delete().eq('id', deleteId)
    setDeleteId(null)
    load()
  }

  const categories = form.type === 'ingreso' ? CATEGORIES_INGRESO : CATEGORIES_EGRESO

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Contabilidad</h1>
          <p className="text-gray-500 text-sm mt-1">Control de ingresos y egresos del negocio</p>
        </div>
        <button onClick={openModal} className="flex items-center gap-2 bg-[#8B4513] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#5C2D0E] transition-colors shadow-sm">
          <Plus size={18} /> Nuevo registro
        </button>
      </div>

      {/* Filtro por mes */}
      <div className="mb-6">
        <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]" />
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <p className="text-sm text-gray-500">Ingresos</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{fmtCOP(totalIngresos)}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <TrendingDown className="text-red-500" size={20} />
            </div>
            <p className="text-sm text-gray-500">Egresos</p>
          </div>
          <p className="text-2xl font-bold text-red-500">{fmtCOP(totalEgresos)}</p>
        </div>
        <div className={`rounded-2xl p-6 shadow-sm border ${utilidad >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${utilidad >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
              <DollarSign className={utilidad >= 0 ? 'text-emerald-600' : 'text-red-500'} size={20} />
            </div>
            <p className="text-sm text-gray-500">Utilidad</p>
          </div>
          <p className={`text-2xl font-bold ${utilidad >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmtCOP(utilidad)}</p>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Cargando...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {entries.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No hay registros para este mes.</td></tr>
              ) : entries.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(e.entry_date + 'T00:00:00').toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${e.type === 'ingreso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {e.type === 'ingreso' ? 'Ingreso' : 'Egreso'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{e.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{e.description}</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold text-sm ${e.type === 'ingreso' ? 'text-green-600' : 'text-red-500'}`}>
                      {e.type === 'egreso' ? '-' : '+'}{fmtCOP(e.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {!e.order_id && (
                      <button onClick={() => setDeleteId(e.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal nuevo registro */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-800 text-lg">Nuevo Registro</h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <div className="flex gap-3">
                  {(['ingreso', 'egreso'] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, type: t, category: t === 'ingreso' ? 'ventas' : 'insumos' })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${form.type === t
                        ? t === 'ingreso' ? 'bg-green-500 text-white border-green-500' : 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                      {t === 'ingreso' ? 'Ingreso' : 'Egreso'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]">
                  {categories.map((c) => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                  placeholder="Ej: Compra de harina y queso" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto (COP) *</label>
                <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                  placeholder="50000" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input type="date" value={form.entry_date} onChange={(e) => setForm({ ...form, entry_date: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium">Cancelar</button>
              <button onClick={save} disabled={saving || !form.description || !form.amount}
                className="flex-1 bg-[#8B4513] text-white py-2.5 rounded-xl hover:bg-[#5C2D0E] text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2">
                <Check size={16} />{saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar eliminar */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-500" size={24} />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">¿Eliminar registro?</h3>
            <p className="text-gray-500 text-sm mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl hover:bg-red-600 text-sm font-medium">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
