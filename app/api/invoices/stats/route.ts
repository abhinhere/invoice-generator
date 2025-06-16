import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Get total invoices count
    const { count: totalInvoices, error: totalError } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })

    if (totalError) {
      console.error("Total invoices error:", totalError)
      return NextResponse.json({ success: false, error: "Failed to fetch statistics" }, { status: 500 })
    }

    // Get total revenue
    const { data: revenueData, error: revenueError } = await supabase.from("invoices").select("total")

    if (revenueError) {
      console.error("Revenue error:", revenueError)
      return NextResponse.json({ success: false, error: "Failed to fetch statistics" }, { status: 500 })
    }

    const totalRevenue = revenueData?.reduce((sum, invoice) => sum + (invoice.total || 0), 0) || 0

    // Get status counts
    const { data: statusData, error: statusError } = await supabase.from("invoices").select("status")

    if (statusError) {
      console.error("Status error:", statusError)
      return NextResponse.json({ success: false, error: "Failed to fetch statistics" }, { status: 500 })
    }

    const statusCounts =
      statusData?.reduce((acc: any, invoice) => {
        acc[invoice.status] = (acc[invoice.status] || 0) + 1
        return acc
      }, {}) || {}

    // Get monthly stats
    const { data: monthlyData, error: monthlyError } = await supabase
      .from("invoices")
      .select("created_at, total")
      .order("created_at", { ascending: false })
      .limit(1000) // Limit to recent invoices for performance

    if (monthlyError) {
      console.error("Monthly error:", monthlyError)
      return NextResponse.json({ success: false, error: "Failed to fetch statistics" }, { status: 500 })
    }

    // Process monthly stats
    const monthlyStats =
      monthlyData?.reduce((acc: any, invoice) => {
        const date = new Date(invoice.created_at)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

        if (!acc[key]) {
          acc[key] = { count: 0, revenue: 0, year: date.getFullYear(), month: date.getMonth() + 1 }
        }

        acc[key].count += 1
        acc[key].revenue += invoice.total || 0

        return acc
      }, {}) || {}

    const monthlyStatsArray = Object.values(monthlyStats)
      .sort((a: any, b: any) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      })
      .slice(0, 12)
      .reverse()

    const stats = {
      totalInvoices: totalInvoices || 0,
      totalRevenue,
      paidInvoices: statusCounts.paid || 0,
      pendingInvoices: statusCounts.sent || 0,
      overdueInvoices: statusCounts.overdue || 0,
      monthlyStats: monthlyStatsArray,
    }

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch statistics" }, { status: 500 })
  }
}
