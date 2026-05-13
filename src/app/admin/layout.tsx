import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingBag, BookOpen, ExternalLink } from 'lucide-react'

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Productos', icon: Package },
  { href: '/admin/orders', label: 'Órdenes', icon: ShoppingBag },
  { href: '/admin/accounting', label: 'Contabilidad', icon: BookOpen },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#5C2D0E] text-white flex flex-col min-h-screen">
        <div className="p-6 border-b border-[#7a3d12]">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-[#F5DEB3] rounded-full flex items-center justify-center">
              <span className="text-[#5C2D0E] font-bold text-sm">TE</span>
            </div>
            <div>
              <p className="font-bold text-sm">Tía Elena</p>
              <p className="text-[#F5DEB3] text-xs">Panel de Control</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#7a3d12] transition-colors text-sm font-medium group"
            >
              <Icon size={18} className="text-[#F5DEB3] group-hover:text-white transition-colors" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[#7a3d12]">
          <Link href="/" className="flex items-center gap-2 text-[#F5DEB3] text-xs hover:text-white transition-colors">
            <ExternalLink size={14} />
            Ver sitio público
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
