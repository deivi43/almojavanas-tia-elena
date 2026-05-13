import { supabase } from '@/lib/supabase'
import { Package, ShoppingBag, TrendingUp, DollarSign } from 'lucide-react'
import Link from 'next/link'

async function getDashboardStats() {
  const [{ count: totalProducts }, { count: totalOrders }, { count: pendingOrders }, accounting] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('available', true),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pendiente'),
    supabase.from('accounting_entries').select('amount, type'),
  ])

  const entries = accounting.data ?? []
  const totalIncome = entries.filter((e) => e.type === 'ingreso').reduce((s, e) => s + e.amount, 0)
  const totalExpense = entries.filter((e) => e.type === 'egreso').reduce((s, e) => s + e.amount, 0)

  return { totalProducts: totalProducts ?? 0, totalOrders: totalOrders ?? 0, pendingOrders: pendingOrders ?? 0, totalIncome, totalExpense }
}

async function getRecentOrders() {
  const { data } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, total, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  return data ?? []
}

const statusLabel: Record<string, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  en_proceso: { label: 'En proceso', color: 'bg-blue-100 text-blue-700' },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-700' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
}

export default async function AdminDashboard() {
  const [stats, recentOrders] = await Promise.all([getDashboardStats(), getRecentOrders()])

  const cards = [
    { label: 'Productos activos', value: stats.totalProducts, icon: Package, color: 'bg-amber-50 text-amber-700', link: '/admin/products' },
    { label: 'Total órdenes', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-blue-50 text-blue-700', link: '/admin/orders' },
    { label: 'Órdenes pendientes', value: stats.pendingOrders, icon: TrendingUp, color: 'bg-orange-50 text-orange-700', link: '/admin/orders' },
    { label: 'Ingresos totales', value: `$${stats.totalIncome.toLocaleString('es-CO')}`, icon: DollarSign, color: 'bg-green-50 text-green-700', link: '/admin/accounting' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen general del negocio</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {cards.map(({ label, value, icon: Icon, color, link }) => (
          <Link key={label} href={link} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-gray-500 text-sm mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Órdenes recientes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-800">Órdenes Recientes</h2>
          <Link href="/admin/orders" className="text-[#8B4513] text-sm font-medium hover:underline">Ver todas</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No hay órdenes aún</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const st = statusLabel[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600' }
              return (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">#{order.order_number} · {order.customer_name}</p>
                    <p className="text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString('es-CO')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.color}`}>{st.label}</span>
                    <span className="font-bold text-gray-700 text-sm">${order.total.toLocaleString('es-CO')}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
