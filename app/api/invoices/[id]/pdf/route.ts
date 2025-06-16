import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { renderToBuffer } from "@react-pdf/renderer"
import { InvoicePDF } from "@/components/pdf-invoice"
import React from "react"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ success: false, error: "Invalid invoice ID format" }, { status: 400 })
    }

    // Fetch invoice with items
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
      console.error("Supabase error:", error)
      if (error.code === "PGRST116") {
        return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 })
      }
      return NextResponse.json({ success: false, error: "Failed to fetch invoice" }, { status: 500 })
    }

    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 })
    }

    // Prepare invoice data for PDF generation with proper validation
    const invoiceData = {
      customerName: invoice.customer_name || "Unknown Customer",
      date: new Date(invoice.invoice_date),
      items: (invoice.invoice_items || []).map((item: any) => ({
        id: item.item_id || item.id || "unknown",
        name: item.name || "Unknown Item",
        quantity: Number(item.quantity) || 0,
        rate: Number(item.rate) || 0,
      })),
      discount: Number(invoice.discount) || 0,
      subtotal: Number(invoice.subtotal) || 0,
      discountAmount: Number(invoice.discount_amount) || 0,
      total: Number(invoice.total) || 0,
      invoiceNumber: invoice.invoice_number || "INV-0000",
    }

    // Validate that we have the required data
    if (!invoiceData.customerName || !invoiceData.invoiceNumber) {
      return NextResponse.json({ success: false, error: "Invalid invoice data" }, { status: 400 })
    }

    // Generate PDF with error handling
    let pdfBuffer: Buffer
    try {
      const pdfElement = React.createElement(InvoicePDF, { data: invoiceData })
      pdfBuffer = await renderToBuffer(pdfElement)
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate PDF",
          details: pdfError instanceof Error ? pdfError.message : "Unknown PDF error",
        },
        { status: 500 },
      )
    }

    // Return PDF as response
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${invoice.invoice_number}.pdf"`,
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Error generating invoice PDF:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
