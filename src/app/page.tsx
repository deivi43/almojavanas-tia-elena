import { supabase, Product } from '@/lib/supabase'
import OrderForm from '@/components/OrderForm'
import { Phone, MapPin, Clock, Star } from 'lucide-react'

async function getProducts(): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('available', true)
    .order('created_at', { ascending: true })
  return data ?? []
}

export default async function Home() {
  const products = await getProducts()

  return (
    <main className="min-h-screen bg-[#fefdf8]">
      {/* Header */}
      <header className="bg-[#5C2D0E] text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#F5DEB3] rounded-full flex items-center justify-center">
              <span className="text-[#5C2D0E] font-bold text-lg">TE</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">Tía Elena</h1>
              <p className="text-[#F5DEB3] text-xs">Almojavanas Artesanales</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <a href="#productos" className="hover:text-[#F5DEB3] transition-colors">Productos</a>
            <a href="#pedido" className="hover:text-[#F5DEB3] transition-colors">Hacer Pedido</a>
            <a href="#contacto" className="hover:text-[#F5DEB3] transition-colors">Contacto</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-linear-to-br from-[#5C2D0E] to-[#8B4513] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#F5DEB3] text-sm font-semibold uppercase tracking-widest mb-3">Tradición Colombiana</p>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Almojavanas hechas<br />con amor
          </h2>
          <p className="text-lg text-[#f0d9b5] max-w-2xl mx-auto mb-10">
            Preparadas de forma artesanal con queso fresco colombiano, siguiendo la receta de siempre.
            Frescas, esponjosas y llenas de sabor.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#pedido" className="bg-[#F5DEB3] text-[#5C2D0E] font-bold px-8 py-3 rounded-full hover:bg-white transition-colors shadow-lg">
              Hacer Pedido
            </a>
            <a href="#productos" className="border-2 border-[#F5DEB3] text-[#F5DEB3] font-bold px-8 py-3 rounded-full hover:bg-[#F5DEB3] hover:text-[#5C2D0E] transition-colors">
              Ver Productos
            </a>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-12 bg-white border-b border-[#e8d5b0]">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            { icon: Star, title: 'Calidad Premium', desc: 'Ingredientes frescos y naturales seleccionados cuidadosamente' },
            { icon: Clock, title: 'Recién Horneadas', desc: 'Preparadas diariamente para garantizar su frescura y sabor' },
            { icon: MapPin, title: 'Entrega a Domicilio', desc: 'Llevamos nuestras almojavanas hasta la puerta de tu hogar' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-3 p-6">
              <div className="w-14 h-14 bg-[#f5e6c8] rounded-full flex items-center justify-center">
                <Icon className="text-[#8B4513]" size={24} />
              </div>
              <h3 className="font-bold text-[#5C2D0E] text-lg">{title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Productos */}
      <section id="productos" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#8B4513] text-sm font-semibold uppercase tracking-widest mb-2">Lo que ofrecemos</p>
            <h2 className="text-3xl font-bold text-[#5C2D0E]">Nuestros Productos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-[#e8d5b0] hover:shadow-xl transition-shadow">
                <div className="h-48 bg-linear-to-br from-[#f5e6c8] to-[#e8c99a] flex items-center justify-center">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <span className="text-6xl">🫓</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-[#5C2D0E] text-lg mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#8B4513]">
                      ${product.price.toLocaleString('es-CO')}
                    </span>
                    <a href="#pedido" className="bg-[#8B4513] text-white text-sm px-4 py-2 rounded-full hover:bg-[#5C2D0E] transition-colors font-medium">
                      Pedir
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulario de pedido */}
      <section id="pedido" className="py-16 px-4 bg-[#f9f3e8]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[#8B4513] text-sm font-semibold uppercase tracking-widest mb-2">Sin complicaciones</p>
            <h2 className="text-3xl font-bold text-[#5C2D0E]">Hacer un Pedido</h2>
            <p className="text-gray-600 mt-3">Completa el formulario y nos ponemos en contacto contigo</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-8 border border-[#e8d5b0]">
            <OrderForm products={products} />
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="py-12 bg-[#5C2D0E] text-white px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8">Contáctanos</h2>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-2">
              <Phone size={18} className="text-[#F5DEB3]" />
              <span className="text-[#f0d9b5]">+57 300 000 0000</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-[#F5DEB3]" />
              <span className="text-[#f0d9b5]">Colombia</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#F5DEB3]" />
              <span className="text-[#f0d9b5]">Lun – Sáb: 6am – 6pm</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#3d1a05] text-[#c4a06a] text-center text-sm py-5">
        © {new Date().getFullYear()} Tía Elena · Almojavanas Artesanales
      </footer>
    </main>
  )
}
