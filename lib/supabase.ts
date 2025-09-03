import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          contact: string
          address: string | null
          credit_limit: number
          credit_days: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact: string
          address?: string | null
          credit_limit?: number
          credit_days?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact?: string
          address?: string | null
          credit_limit?: number
          credit_days?: number
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          name: string
          contact: string
          type: 'item' | 'service' | 'both'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact: string
          type?: 'item' | 'service' | 'both'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact?: string
          type?: 'item' | 'service' | 'both'
          created_at?: string
          updated_at?: string
        }
      }
      items: {
        Row: {
          id: string
          name: string
          vendor_id: string | null
          buy_price: number
          sell_price: number
          stock_qty: number
          warranty: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          vendor_id?: string | null
          buy_price: number
          sell_price: number
          stock_qty?: number
          warranty?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          vendor_id?: string | null
          buy_price?: number
          sell_price?: number
          stock_qty?: number
          warranty?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          vendor_id: string | null
          cost: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          vendor_id?: string | null
          cost: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          vendor_id?: string | null
          cost?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          client_id: string
          type: 'item' | 'service'
          total_amount: number
          status: 'pending' | 'approved' | 'delivered' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          type: 'item' | 'service'
          total_amount?: number
          status?: 'pending' | 'approved' | 'delivered' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          type?: 'item' | 'service'
          total_amount?: number
          status?: 'pending' | 'approved' | 'delivered' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      order_details: {
        Row: {
          id: string
          order_id: string
          item_id: string | null
          service_id: string | null
          quantity: number
          unit_price: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          item_id?: string | null
          service_id?: string | null
          quantity?: number
          unit_price: number
          subtotal?: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          item_id?: string | null
          service_id?: string | null
          quantity?: number
          unit_price?: number
          subtotal?: number
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          order_id: string
          client_id: string
          vendor_id: string | null
          type: 'proforma' | 'delivery_note' | 'payment_statement' | 'receipt' | 'job_card' | 'diagnosis'
          status: 'pending' | 'approved' | 'delivered' | 'paid'
          due_date: string | null
          file_path: string | null
          document_number: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          client_id: string
          vendor_id?: string | null
          type: 'proforma' | 'delivery_note' | 'payment_statement' | 'receipt' | 'job_card' | 'diagnosis'
          status?: 'pending' | 'approved' | 'delivered' | 'paid'
          due_date?: string | null
          file_path?: string | null
          document_number?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          client_id?: string
          vendor_id?: string | null
          type?: 'proforma' | 'delivery_note' | 'payment_statement' | 'receipt' | 'job_card' | 'diagnosis'
          status?: 'pending' | 'approved' | 'delivered' | 'paid'
          due_date?: string | null
          file_path?: string | null
          document_number?: string
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          client_id: string
          order_id: string
          amount_paid: number
          balance: number
          payment_date: string
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          order_id: string
          amount_paid: number
          balance?: number
          payment_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          order_id?: string
          amount_paid?: number
          balance?: number
          payment_date?: string
          created_at?: string
        }
      }
      technicians: {
        Row: {
          id: string
          name: string
          contact: string
          service_ids: any
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact: string
          service_ids?: any
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact?: string
          service_ids?: any
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      client_summary: {
        Row: {
          id: string
          name: string
          contact: string
          credit_limit: number
          credit_days: number
          total_orders: number
          outstanding_balance: number
          total_revenue: number
          last_order_date: string | null
        }
      }
      vendor_performance: {
        Row: {
          id: string
          name: string
          type: 'item' | 'service' | 'both'
          total_orders: number
          total_revenue: number
          avg_order_value: number | null
          total_items: number
          total_services: number
        }
      }
      inventory_status: {
        Row: {
          id: string
          name: string
          vendor_name: string | null
          stock_qty: number
          buy_price: number
          sell_price: number
          profit_margin: number
          stock_status: string
        }
      }
    }
  }
} 