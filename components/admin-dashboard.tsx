"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search,
  Eye,
  Trash2,
  Plus,
  FileText,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Printer,
  Download,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "@/hooks/use-toast"

interface InvoiceItem {
  id: string
  item_id: string
  name: string
  quantity: number
  rate: number
  total: number
}

interface Invoice {
  id: string
  invoice_number: string
  customer_name: string
  customer_email?: string
  invoice_date: string
  due_date: string
  items: InvoiceItem[]
  subtotal: number
  discount: number
  discount_amount: number
  total: number
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  created_at: string
  updated_at: string
}

interface Stats {
  totalInvoices: number
  totalRevenue: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// Add this at the top of the component, after the imports
const ErrorBoundary = ({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("Dashboard error:", error)
      setHasError(true)
    }

    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  if (hasError) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export default function AdminDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [printingInvoice, setPrintingInvoice] = useState<string | null>(null)

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")

  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        search: searchTerm.trim(),
        status: statusFilter === "all" ? "" : statusFilter,
        sortBy,
        sortOrder,
      })

      const response = await fetch(`/api/invoices?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setInvoices(data.data.invoices || [])
        setPagination(data.data.pagination || null)
      } else {
        console.error("API error:", data)
        toast({
          title: "Error",
          description: data.error || "Failed to fetch invoices",
          variant: "destructive",
        })
        // Set empty state on error
        setInvoices([])
        setPagination(null)
      }
    } catch (error) {
      console.error("Fetch error:", error)
      toast({
        title: "Connection Error",
        description: "Unable to connect to the database. Please check your connection.",
        variant: "destructive",
      })
      // Set empty state on error
      setInvoices([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch("/api/invoices/stats")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      } else {
        console.error("Stats API error:", data)
        // Set default stats on error
        setStats({
          totalInvoices: 0,
          totalRevenue: 0,
          paidInvoices: 0,
          pendingInvoices: 0,
          overdueInvoices: 0,
        })
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
      // Set default stats on error
      setStats({
        totalInvoices: 0,
        totalRevenue: 0,
        paidInvoices: 0,
        pendingInvoices: 0,
        overdueInvoices: 0,
      })
    }
  }

  // Delete invoice
  const deleteInvoice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return

    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Invoice deleted successfully",
        })
        fetchInvoices()
        fetchStats()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete invoice",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      })
    }
  }

  // Download invoice PDF
  const downloadInvoicePdf = async (invoice: Invoice) => {
    try {
      setPrintingInvoice(invoice.id)

      const response = await fetch(`/api/invoices/${invoice.id}/pdf`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const blob = await response.blob()

      // Verify we got a PDF
      if (blob.type !== "application/pdf") {
        throw new Error("Invalid response format - expected PDF")
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${invoice.invoice_number}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: `Invoice ${invoice.invoice_number} downloaded successfully`,
      })
    } catch (error) {
      console.error("Error downloading invoice PDF:", error)
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Unable to download invoice PDF",
        variant: "destructive",
      })
    } finally {
      setPrintingInvoice(null)
    }
  }

  // Print invoice PDF
  const printInvoice = async (invoice: Invoice) => {
    try {
      setPrintingInvoice(invoice.id)

      const response = await fetch(`/api/invoices/${invoice.id}/pdf`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const blob = await response.blob()

      // Verify we got a PDF
      if (blob.type !== "application/pdf") {
        throw new Error("Invalid response format - expected PDF")
      }

      const url = URL.createObjectURL(blob)

      // Open in new window and print
      const printWindow = window.open(url, "_blank")

      if (!printWindow) {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups to print the invoice, or try downloading instead.",
          variant: "destructive",
        })
        return
      }

      // Wait for the PDF to load then print
      printWindow.addEventListener("load", () => {
        setTimeout(() => {
          try {
            printWindow.print()
            toast({
              title: "Print Dialog Opened",
              description: `Print dialog opened for invoice ${invoice.invoice_number}`,
            })
          } catch (printError) {
            console.error("Print error:", printError)
            toast({
              title: "Print Failed",
              description: "Unable to open print dialog. Please try downloading the PDF instead.",
              variant: "destructive",
            })
          }
        }, 1000)
      })

      // Clean up the URL object after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 60000)
    } catch (error) {
      console.error("Error printing invoice:", error)
      toast({
        title: "Print Failed",
        description: error instanceof Error ? error.message : "Unable to print invoice",
        variant: "destructive",
      })
    } finally {
      setPrintingInvoice(null)
    }
  }

  // Update invoice status
  const updateInvoiceStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Invoice status updated successfully",
        })
        fetchInvoices()
        fetchStats()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update invoice status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Update error:", error)
      toast({
        title: "Error",
        description: "Failed to update invoice status",
        variant: "destructive",
      })
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "sent":
        return "secondary"
      case "overdue":
        return "destructive"
      case "cancelled":
        return "outline"
      default:
        return "secondary"
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder])

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Dashboard Error</h1>
          <p className="text-gray-600 mb-4">There was an error loading the dashboard.</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Invoice Dashboard</h1>
            <p className="text-gray-600">Manage and track all your invoices</p>
          </div>
          <Button onClick={() => window.open("/", "_blank")}>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInvoices}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.paidInvoices}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingInvoices}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.overdueInvoices}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="invoice_date">Invoice Date</SelectItem>
                  <SelectItem value="total">Amount</SelectItem>
                  <SelectItem value="customer_name">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Invoices Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading invoices...
                      </TableCell>
                    </TableRow>
                  ) : invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{invoice.customer_name}</div>
                            {invoice.customer_email && (
                              <div className="text-sm text-gray-500">{invoice.customer_email}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(invoice.invoice_date), "dd MMM yyyy")}</TableCell>
                        <TableCell>{format(new Date(invoice.due_date), "dd MMM yyyy")}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(invoice.total)}</TableCell>
                        <TableCell>
                          <Select
                            value={invoice.status}
                            onValueChange={(value) => updateInvoiceStatus(invoice.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <Badge variant={getStatusBadgeVariant(invoice.status)}>{invoice.status}</Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="sent">Sent</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="overdue">Overdue</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedInvoice(invoice)
                                setShowInvoiceDialog(true)
                              }}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => downloadInvoicePdf(invoice)}
                              disabled={printingInvoice === invoice.id}
                              title="Download PDF"
                            >
                              {printingInvoice === invoice.id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => printInvoice(invoice)}
                              disabled={printingInvoice === invoice.id}
                              title="Print PDF"
                            >
                              {printingInvoice === invoice.id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                              ) : (
                                <Printer className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteInvoice(invoice.id)}
                              title="Delete Invoice"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{" "}
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{" "}
                  {pagination.totalItems} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Details Dialog */}
        <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-6">
                {/* Invoice Header */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedInvoice.invoice_number}</h3>
                    <p className="text-gray-600">
                      Created: {format(new Date(selectedInvoice.created_at), "dd MMM yyyy, HH:mm")}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={getStatusBadgeVariant(selectedInvoice.status)} className="mb-2">
                      {selectedInvoice.status}
                    </Badge>
                    <p className="text-2xl font-bold">{formatCurrency(selectedInvoice.total)}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Customer Information</h4>
                    <p className="font-medium">{selectedInvoice.customer_name}</p>
                    {selectedInvoice.customer_email && (
                      <p className="text-gray-600">{selectedInvoice.customer_email}</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Invoice Dates</h4>
                    <p>Invoice Date: {format(new Date(selectedInvoice.invoice_date), "dd MMM yyyy")}</p>
                    <p>Due Date: {format(new Date(selectedInvoice.due_date), "dd MMM yyyy")}</p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-semibold mb-4">Items</h4>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                          selectedInvoice.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell className="text-center">{item.quantity}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                              No items found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Summary */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount ({selectedInvoice.discount}%):</span>
                      <span>- {formatCurrency(selectedInvoice.discount_amount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedInvoice.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => downloadInvoicePdf(selectedInvoice)}
                    disabled={printingInvoice === selectedInvoice.id}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={() => printInvoice(selectedInvoice)}
                    disabled={printingInvoice === selectedInvoice.id}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print PDF
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  )
}
