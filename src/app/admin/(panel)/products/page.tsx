'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase, Product } from '@/lib/supabase'
import { Plus, Pencil, Trash2, X, Check, ToggleLeft, ToggleRight, Upload, ImageIcon } from 'lucide-react'

const empty = { name: '', description: '', price: '', available: true }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [form, setForm] = useState<typeof empty>(empty)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm(empty); setEditId(null); setImageFile(null); setImagePreview(null); setSaveError(null); setModal('create')
  }
  const openEdit = (p: Product) => {
    setForm({ name: p.name, description: p.description ?? '', price: String(p.price), available: p.available })
    setEditId(p.id)
    setImageFile(null)
    setImagePreview(p.image_url ?? null)
    setModal('edit')
  }
  const closeModal = () => { setModal(null); setEditId(null); setImageFile(null); setImagePreview(null); setSaveError(null) }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
    if (error) {
      setSaveError(`Error al subir imagen: ${error.message}`)
      return null
    }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    return data.publicUrl
  }

  const save = async () => {
    if (!form.name || !form.price) return
    setSaving(true)
    setSaveError(null)
    let image_url: string | null = imagePreview && !imageFile ? imagePreview : null
    if (imageFile) {
      const uploaded = await uploadImage(imageFile)
      if (!uploaded && imageFile) {
        setSaving(false)
        return
      }
      image_url = uploaded
    }
    const payload = { name: form.name, description: form.description || null, price: parseFloat(form.price), image_url, available: form.available }
    if (modal === 'create') {
      const { error } = await supabase.from('products').insert(payload)
      if (error) { setSaveError(`Error al guardar: ${error.message}`); setSaving(false); return }
    } else if (editId) {
      const { error } = await supabase.from('products').update(payload).eq('id', editId)
      if (error) { setSaveError(`Error al guardar: ${error.message}`); setSaving(false); return }
    }
    setSaving(false)
    closeModal()
    load()
  }

  const toggleAvailable = async (p: Product) => {
    await supabase.from('products').update({ available: !p.available }).eq('id', p.id)
    load()
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    await supabase.from('products').delete().eq('id', deleteId)
    setDeleteId(null)
    load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona tu catálogo de almojavanas</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-[#8B4513] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#5C2D0E] transition-colors shadow-sm">
          <Plus size={18} /> Nuevo producto
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Cargando...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Imagen</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No hay productos. Crea el primero.</td></tr>
              ) : products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#f5e6c8] flex items-center justify-center">
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        : <ImageIcon size={20} className="text-[#8B4513] opacity-50" />
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-500 text-sm line-clamp-2 max-w-xs">{p.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#8B4513]">${p.price.toLocaleString('es-CO')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleAvailable(p)} className="flex items-center gap-1.5 text-sm">
                      {p.available
                        ? <><ToggleRight className="text-green-500" size={22} /><span className="text-green-600 font-medium">Activo</span></>
                        : <><ToggleLeft className="text-gray-400" size={22} /><span className="text-gray-400">Inactivo</span></>
                      }
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleteId(p.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear/editar */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-800 text-lg">{modal === 'create' ? 'Nuevo Producto' : 'Editar Producto'}</h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="space-y-4">

              {/* Subida de imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Foto del producto</label>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-40 border-2 border-dashed border-[#e8d5b0] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#8B4513] hover:bg-[#fef9f0] transition-colors overflow-hidden"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <Upload className="mx-auto text-[#8B4513] mb-2" size={28} />
                      <p className="text-sm font-medium text-[#8B4513]">Haz clic para subir una foto</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · Máx 5MB</p>
                    </div>
                  )}
                </div>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null) }}
                    className="mt-1 text-xs text-red-400 hover:text-red-600"
                  >
                    Quitar imagen
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                  placeholder="Almojavana Tradicional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513] resize-none"
                  rows={3} placeholder="Descripción del producto..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio (COP) *</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                  placeholder="1500" min="0" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} className="rounded" />
                <span className="text-sm text-gray-700">Producto disponible</span>
              </label>
            </div>
            {saveError && (
              <p className="mt-4 text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{saveError}</p>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={closeModal} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium">
                Cancelar
              </button>
              <button onClick={save} disabled={saving || !form.name || !form.price}
                className="flex-1 bg-[#8B4513] text-white py-2.5 rounded-xl hover:bg-[#5C2D0E] text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2">
                <Check size={16} />{saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar eliminación */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-500" size={24} />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">¿Eliminar producto?</h3>
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
