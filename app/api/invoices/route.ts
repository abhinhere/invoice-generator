import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    // Calculate pagination
    const offset = (page - 1) * limit

    // Build query
    let query = supabase.from("invoices").select(`
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

    // Apply search filter
    if (search) {
      query = query.or(
        `customer_name.ilike.%${search}%,invoice_number.ilike.%${search}%,customer_email.ilike.%${search}%`,
      )
    }

    // Apply status filter
    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    // Apply sorting
    const ascending = sortOrder === "asc"
    query = query.order(sortBy, { ascending })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: invoices, error, count } = await query

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch invoices" }, { status: 500 })
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Count error:", countError)
      return NextResponse.json({ success: false, error: "Failed to get total count" }, { status: 500 })
    }

    // Transform data to match expected format
    const transformedInvoices =
      invoices?.map((invoice: any) => ({
        ...invoice,
        items: invoice.invoice_items || [],
      })) || []

    // Calculate pagination info
    const total = totalCount || 0
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: {
        invoices: transformedInvoices,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch invoices" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { invoice_number, customer_name, invoice_date, items, subtotal, total } = body

    if (!invoice_number || !customer_name || !invoice_date || !items || items.length === 0) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Calculate due date (30 days from invoice date)
    const invoiceDate = new Date(invoice_date)
    const dueDate = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Insert invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        invoice_number,
        customer_name,
        customer_email: body.customer_email || null,
        customer_phone: body.customer_phone || null,
        customer_address: body.customer_address || null,
        invoice_date: invoiceDate.toISOString().split("T")[0],
        due_date: dueDate.toISOString().split("T")[0],
        subtotal,
        discount: body.discount || 0,
        discount_amount: body.discount_amount || 0,
        total,
        status: body.status || "draft",
        notes: body.notes || null,
      })
      .select()
      .single()

    if (invoiceError) {
      console.error("Invoice creation error:", invoiceError)
      if (invoiceError.code === "23505") {
        return NextResponse.json({ success: false, error: "Invoice number already exists" }, { status: 409 })
      }
      return NextResponse.json({ success: false, error: "Failed to create invoice" }, { status: 500 })
    }

    // Insert invoice items
    const invoiceItems = items.map((item: any) => ({
      invoice_id: invoice.id,
      item_id: item.id,
      name: item.name,
      quantity: item.quantity,
      rate: item.rate,
      total: item.quantity * item.rate,
    }))

    const { error: itemsError } = await supabase.from("invoice_items").insert(invoiceItems)

    if (itemsError) {
      console.error("Invoice items creation error:", itemsError)
      // Rollback: delete the invoice if items creation failed
      await supabase.from("invoices").delete().eq("id", invoice.id)
      return NextResponse.json({ success: false, error: "Failed to create invoice items" }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        data: { ...invoice, items: invoiceItems },
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating invoice:", error)
    return NextResponse.json({ success: false, error: "Failed to create invoice" }, { status: 500 })
  }
}
