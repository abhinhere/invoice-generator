export interface Database {
  public: {
    Tables: {
      invoices: {
        Row: {
          id: string
          invoice_number: string
          customer_name: string
          customer_email: string | null
          customer_phone: string | null
          customer_address: string | null
          invoice_date: string
          due_date: string
          subtotal: number
          discount: number
          discount_amount: number
          total: number
          status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
          notes: string | null
          pdf_url: string | null
          payment_method: string | null
          payment_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          customer_name: string
          customer_email?: string | null
          customer_phone?: string | null
          customer_address?: string | null
          invoice_date: string
          due_date: string
          subtotal: number
          discount?: number
          discount_amount?: number
          total: number
          status?: "draft" | "sent" | "paid" | "overdue" | "cancelled"
          notes?: string | null
          pdf_url?: string | null
          payment_method?: string | null
          payment_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          customer_name?: string
          customer_email?: string | null
          customer_phone?: string | null
          customer_address?: string | null
          invoice_date?: string
          due_date?: string
          subtotal?: number
          discount?: number
          discount_amount?: number
          total?: number
          status?: "draft" | "sent" | "paid" | "overdue" | "cancelled"
          notes?: string | null
          pdf_url?: string | null
          payment_method?: string | null
          payment_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          item_id: string
          name: string
          quantity: number
          rate: number
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          item_id: string
          name: string
          quantity: number
          rate: number
          total: number
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          item_id?: string
          name?: string
          quantity?: number
          rate?: number
          total?: number
          created_at?: string
        }
      }
    }
  }
}

export interface InvoiceItem {
  id: string
  name: string
  quantity: number
  rate: number
  total: number
}

export interface Invoice {
  id: string
  invoice_number: string
  customer_name: string
  customer_email?: string | null
  customer_phone?: string | null
  customer_address?: string | null
  invoice_date: string
  due_date: string
  items: InvoiceItem[]
  subtotal: number
  discount: number
  discount_amount: number
  total: number
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  notes?: string | null
  pdf_url?: string | null
  payment_method?: string | null
  payment_date?: string | null
  created_at: string
  updated_at: string
}
