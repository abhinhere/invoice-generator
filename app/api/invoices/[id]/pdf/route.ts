import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { renderToBuffer } from "@react-pdf/renderer"
import { InvoicePDF } from "@/components/pdf-invoice"

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

    // Prepare invoice data for PDF generation
    const invoiceData = {
      customerName: invoice.customer_name,
      date: new Date(invoice.invoice_date),
      items:
        invoice.invoice_items?.map((item: any) => ({
          id: item.item_id,
          name: item.name,
          quantity: item.quantity,
          rate: item.rate,
        })) || [],
      discount: invoice.discount,
      subtotal: invoice.subtotal,
      discountAmount: invoice.discount_amount,
      total: invoice.total,
      invoiceNumber: invoice.invoice_number,
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(<InvoicePDF data={invoiceData} />)

    // Return PDF as response
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${invoice.invoice_number}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating invoice PDF:", error)
    return NextResponse.json({ success: false, error: "Failed to generate PDF" }, { status: 500 })
  }
}
