import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  available: boolean
  created_at: string
  updated_at: string
}

export type Order = {
  id: string
  order_number: number
  customer_name: string
  address: string
  delivery_location: string
  payment_method: 'efectivo' | 'transferencia' | 'nequi' | 'daviplata'
  status: 'pendiente' | 'en_proceso' | 'entregado' | 'cancelado'
  total: number
  notes: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export type AccountingEntry = {
  id: string
  type: 'ingreso' | 'egreso'
  category: string
  description: string
  amount: number
  order_id: string | null
  entry_date: string
  created_at: string
}
