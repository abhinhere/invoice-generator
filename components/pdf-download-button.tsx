"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { pdf } from "@react-pdf/renderer"
import { InvoicePDF } from "./pdf-invoice"

interface OrderItem {
  id: string
  name: string
  quantity: number
  rate: number
}

interface InvoiceData {
  customerName: string
  date: Date
  items: OrderItem[]
  discount: number
  subtotal: number
  discountAmount: number
  total: number
}

export default function PdfDownloadButton({ invoiceData }: { invoiceData: InvoiceData }) {
  const [isClient, setIsClient] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const generatePdf = async () => {
    if (!isClient) return

    try {
      setIsGenerating(true)

      // Validate data before generating PDF
      if (!invoiceData) {
        throw new Error("Invoice data is missing")
      }

      // Create PDF with validated data
      const pdfDoc = <InvoicePDF data={invoiceData} />
      const blob = await pdf(pdfDoc).toBlob()

      // Create a download link and trigger it
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `invoice-${format(invoiceData.date || new Date(), "yyyyMMdd")}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  if (!isClient) {
    return (
      <Button className="w-full mt-4" disabled>
        Generate Invoice
      </Button>
    )
  }

  return (
    <Button className="w-full mt-4" onClick={generatePdf} disabled={isGenerating}>
      {isGenerating ? "Generating PDF..." : "Generate Invoice"}
    </Button>
  )
}
