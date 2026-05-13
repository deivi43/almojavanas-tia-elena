'use client'

import { useEffect, useState } from 'react'
import { supabase, Order } from '@/lib/supabase'
import { ChevronDown, Search, Eye, X } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'en_proceso', label: 'En proceso', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'entregado', label: 'Entregado', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200' },
]

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  nequi: 'Nequi',
  daviplata: 'Daviplata',
}

function StatusBadge({ status }: { status: string }) {
  const opt = STATUS_OPTIONS.find((s) => s.value === status) ?? { label: status, color: 'bg-gray-100 text-gray-600 border-gray-200' }
  return <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${opt.color}`}>{opt.label}</span>
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [detail, setDetail] = useState<Order | null>(null)
  const [detailItems, setDetailItems] = useState<Order['order_items']>([])

  const load = async () => {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (filterStatus) query = query.eq('status', filterStatus)
    const { data } = await query
    setOrders(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filterStatus])

  const openDetail = async (order: Order) => {
    const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id)
    setDetailItems(data ?? [])
    setDetail(order)
  }

  const changeStatus = async (orderId: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o))
    if (detail?.id === orderId) setDetail((prev) => prev ? { ...prev, status: newStatus as Order['status'] } : prev)
  }

  const filtered = orders.filter((o) =>
    !search || o.customer_name.toLowerCase().includes(search.toLowerCase()) || String(o.order_number).includes(search)
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Órdenes</h1>
        <p className="text-gray-500 text-sm mt-1">Gestiona los pedidos de tus clientes</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
            placeholder="Buscar por nombre u orden #" />
        </div>
        <div className="relative">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513] cursor-pointer">
            <option value="">Todos los estados</option>
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Cargando...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lugar</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pago</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No hay órdenes.</td></tr>
              ) : filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-[#8B4513]">#{order.order_number}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800 text-sm">{order.customer_name}</p>
                    <p className="text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString('es-CO')}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{order.delivery_location}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{PAYMENT_LABELS[order.payment_method] ?? order.payment_method}</td>
                  <td className="px-6 py-4 font-bold text-gray-800 text-sm">${order.total.toLocaleString('es-CO')}</td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <select value={order.status} onChange={(e) => changeStatus(order.id, e.target.value)}
                        className="appearance-none text-xs font-medium border rounded-full pl-3 pr-7 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8B4513] bg-white
                          border-gray-200 text-gray-600">
                        {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => openDetail(order)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal detalle */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-gray-800 text-lg">Orden #{detail.order_number}</h2>
                <p className="text-gray-400 text-xs">{new Date(detail.created_at).toLocaleString('es-CO')}</p>
              </div>
              <button onClick={() => setDetail(null)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              {[
                { label: 'Cliente', value: detail.customer_name },
                { label: 'Dirección', value: detail.address },
                { label: 'Lugar', value: detail.delivery_location },
                { label: 'Pago', value: PAYMENT_LABELS[detail.payment_method] },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className="font-medium text-gray-800 text-sm">{value}</p>
                </div>
              ))}
            </div>

            {detail.notes && (
              <div className="bg-amber-50 rounded-xl p-3 mb-5">
                <p className="text-xs text-amber-600 mb-1">Notas</p>
                <p className="text-sm text-gray-700">{detail.notes}</p>
              </div>
            )}

            <div className="mb-5">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Productos</h3>
              <div className="space-y-2">
                {detailItems?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.product_name}</p>
                      <p className="text-xs text-gray-400">{item.quantity} × ${item.unit_price.toLocaleString('es-CO')}</p>
                    </div>
                    <span className="font-bold text-gray-700 text-sm">${item.subtotal.toLocaleString('es-CO')}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-[#8B4513] text-lg">${detail.total.toLocaleString('es-CO')}</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Cambiar estado</p>
              <div className="flex gap-2 flex-wrap">
                {STATUS_OPTIONS.map((s) => (
                  <button key={s.value} onClick={() => changeStatus(detail.id, s.value)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${detail.status === s.value ? s.color : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
