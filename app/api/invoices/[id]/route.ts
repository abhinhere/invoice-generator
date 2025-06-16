import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ success: false, error: "Invalid invoice ID format" }, { status: 400 })
    }

    const { data: invoice, error } = await supabase
      .from("invoices")
      .select(`
        *,
        invoice_items (
          id,
          item_id,
          name,
          quantity,
          rate,
          total
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 })
      }
      console.error("Supabase error:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch invoice" }, { status: 500 })
    }

    // Transform data to match expected format
    const transformedInvoice = {
      ...invoice,
      items: invoice.invoice_items || [],
    }

    return NextResponse.json({
      success: true,
      data: transformedInvoice,
    })
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch invoice" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ success: false, error: "Invalid invoice ID format" }, { status: 400 })
    }

    const { data: invoice, error } = await supabase
      .from("invoices")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 })
      }
      console.error("Supabase error:", error)
      return NextResponse.json({ success: false, error: "Failed to update invoice" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: invoice,
    })
  } catch (error) {
    console.error("Error updating invoice:", error)
    return NextResponse.json({ success: false, error: "Failed to update invoice" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ success: false, error: "Invalid invoice ID format" }, { status: 400 })
    }

    const { error } = await supabase.from("invoices").delete().eq("id", id)

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ success: false, error: "Failed to delete invoice" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Invoice deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting invoice:", error)
    return NextResponse.json({ success: false, error: "Failed to delete invoice" }, { status: 500 })
  }
}
