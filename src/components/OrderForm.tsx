'use client'

import { useState } from 'react'
import { supabase, Product } from '@/lib/supabase'
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle } from 'lucide-react'

type CartItem = { product: Product; quantity: number }

export default function OrderForm({ products }: { products: Product[] }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [form, setForm] = useState({
    customer_name: '',
    address: '',
    delivery_location: '',
    payment_method: 'efectivo',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1 }]
    })
  }

  const changeQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) => i.product.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)
    )
  }

  const removeItem = (id: string) => setCart((prev) => prev.filter((i) => i.product.id !== id))

  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) { setError('Agrega al menos un producto al carrito'); return }
    setLoading(true)
    setError('')

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({ ...form, total })
      .select()
      .single()

    if (orderErr || !order) { setError('Error al crear la orden. Intenta de nuevo.'); setLoading(false); return }

    const items = cart.map((i) => ({
      order_id: order.id,
      product_id: i.product.id,
      product_name: i.product.name,
      quantity: i.quantity,
      unit_price: i.product.price,
    }))

    const { error: itemsErr } = await supabase.from('order_items').insert(items)
    if (itemsErr) { setError('Error al registrar los productos. Contacta con nosotros.'); setLoading(false); return }

    setSuccess(true)
    setCart([])
    setForm({ customer_name: '', address: '', delivery_location: '', payment_method: 'efectivo', notes: '' })
    setLoading(false)
  }

  if (success) {
    return (
      <div className="text-center py-10">
        <CheckCircle className="mx-auto text-green-500 mb-4" size={56} />
        <h3 className="text-2xl font-bold text-[#5C2D0E] mb-2">¡Pedido recibido!</h3>
        <p className="text-gray-600 mb-6">Te contactaremos pronto para confirmar tu orden.</p>
        <button onClick={() => setSuccess(false)} className="bg-[#8B4513] text-white px-6 py-2 rounded-full hover:bg-[#5C2D0E] transition-colors font-medium">
          Hacer otro pedido
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Selección de productos */}
      <div>
        <h3 className="font-bold text-[#5C2D0E] mb-3 flex items-center gap-2">
          <ShoppingCart size={18} /> Selecciona tus productos
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {products.map((p) => {
            const cartItem = cart.find((i) => i.product.id === p.id)
            return (
              <div key={p.id} className="flex items-center justify-between p-3 border border-[#e8d5b0] rounded-xl bg-[#fefdf8]">
                <div>
                  <p className="font-medium text-[#5C2D0E] text-sm">{p.name}</p>
                  <p className="text-[#8B4513] font-bold text-sm">${p.price.toLocaleString('es-CO')}</p>
                </div>
                {cartItem ? (
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => changeQty(p.id, -1)} className="w-7 h-7 rounded-full bg-[#f5e6c8] flex items-center justify-center hover:bg-[#e8c99a]">
                      <Minus size={14} className="text-[#5C2D0E]" />
                    </button>
                    <span className="font-bold text-[#5C2D0E] w-5 text-center">{cartItem.quantity}</span>
                    <button type="button" onClick={() => changeQty(p.id, 1)} className="w-7 h-7 rounded-full bg-[#f5e6c8] flex items-center justify-center hover:bg-[#e8c99a]">
                      <Plus size={14} className="text-[#5C2D0E]" />
                    </button>
                    <button type="button" onClick={() => removeItem(p.id)} className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 ml-1">
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => addToCart(p)} className="bg-[#8B4513] text-white text-xs px-3 py-1.5 rounded-full hover:bg-[#5C2D0E] transition-colors font-medium">
                    Agregar
                  </button>
                )}
              </div>
            )
          })}
        </div>
        {cart.length > 0 && (
          <div className="mt-3 p-3 bg-[#f5e6c8] rounded-xl">
            <p className="text-[#5C2D0E] font-bold text-sm">Total: <span className="text-lg">${total.toLocaleString('es-CO')}</span></p>
          </div>
        )}
      </div>

      {/* Datos del cliente */}
      <div className="space-y-4">
        <h3 className="font-bold text-[#5C2D0E]">Tus datos</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
          <input required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            className="w-full border border-[#e8d5b0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513] bg-white"
            placeholder="Tu nombre" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de entrega *</label>
          <input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full border border-[#e8d5b0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513] bg-white"
            placeholder="Calle, barrio, ciudad" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del sitio o lugar *</label>
          <input required value={form.delivery_location} onChange={(e) => setForm({ ...form, delivery_location: e.target.value })}
            className="w-full border border-[#e8d5b0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513] bg-white"
            placeholder="Ej: Casa, oficina, supermercado..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Medio de pago *</label>
          <select required value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
            className="w-full border border-[#e8d5b0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513] bg-white">
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia Bancaria</option>
            <option value="nequi">Nequi</option>
            <option value="daviplata">Daviplata</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full border border-[#e8d5b0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513] bg-white resize-none"
            rows={3} placeholder="Instrucciones especiales, referencias..." />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full bg-[#8B4513] text-white font-bold py-3 rounded-full hover:bg-[#5C2D0E] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-md">
        {loading ? 'Enviando...' : `Confirmar Pedido${cart.length > 0 ? ` · $${total.toLocaleString('es-CO')}` : ''}`}
      </button>
    </form>
  )
}
