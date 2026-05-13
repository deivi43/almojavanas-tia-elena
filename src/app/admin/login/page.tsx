'use client'

import { useState } from 'react'
import { login } from '@/app/admin/actions'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-[#5C2D0E] via-[#8B4513] to-[#a0522d] flex-col items-center justify-center relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-15 -right-15 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-10 w-40 h-40 rounded-full bg-white/5" />

        <div className="relative z-10 text-center px-12">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#F5DEB3]/40 shadow-2xl mx-auto mb-8">
            <img src="/logo.jpeg" alt="Tía Elena" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Tía Elena</h1>
          <p className="text-[#F5DEB3] text-lg font-medium mb-2">Almojavanas Hechas con Amor</p>
          <p className="text-[#c4956a] text-sm max-w-xs mx-auto leading-relaxed">
            Tradición colombiana en cada bocado. Bienvenido al panel de control de tu negocio.
          </p>

          <div className="mt-10 flex flex-col gap-3 text-left">
            {['Gestiona tus productos', 'Controla tus pedidos', 'Lleva tu contabilidad'].map((text) => (
              <div key={text} className="flex items-center gap-3 text-white/80 text-sm">
                <div className="w-5 h-5 rounded-full bg-[#F5DEB3]/20 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-[#F5DEB3]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center bg-[#fefdf8] px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#5C2D0E] shadow-xl mx-auto mb-4">
              <img src="/logo.jpeg" alt="Tía Elena" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-[#5C2D0E]">Tía Elena</h1>
            <p className="text-gray-500 text-sm">Panel de Administración</p>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Bienvenido</h2>
            <p className="text-gray-500 mt-1 text-sm">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B4513] transition-colors bg-white placeholder-gray-400"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#8B4513] transition-colors bg-white placeholder-gray-400"
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-br from-[#8B4513] to-[#5C2D0E] text-white font-bold py-3.5 rounded-2xl hover:from-[#5C2D0E] hover:to-[#3d1a05] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#8B4513]/30 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Entrando...
                </span>
              ) : 'Entrar al panel'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-xs mt-8">
            Solo el administrador puede acceder a este panel.
          </p>
        </div>
      </div>
    </div>
  )
}
