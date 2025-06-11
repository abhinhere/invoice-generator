"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { pdf } from "@react-pdf/renderer"
import { InvoicePDF } from "./pdf-invoice"
import { Share2, Download, Mail, MessageCircle, Copy, Check, Send, FolderOpen, RotateCcw } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import InvoiceCounter from "@/utils/invoice-counter"

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
  invoiceNumber?: string
}

export default function PdfDownloadButton({ invoiceData }: { invoiceData: InvoiceData }) {
  const [isClient, setIsClient] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [savedToFolder, setSavedToFolder] = useState(false)
  const [currentInvoiceNumber, setCurrentInvoiceNumber] = useState<string>("")

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== "undefined") {
      setCurrentInvoiceNumber(InvoiceCounter.getCurrentInvoiceNumber())
    }
  }, [])

  // Cleanup URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [pdfUrl])

  const saveToInvoiceFolder = async (blob: Blob, filename: string) => {
    try {
      // Check if File System Access API is supported
      if ("showDirectoryPicker" in window) {
        try {
          // Try to get or create the Invoice Generator folder
          const directoryHandle = await (window as any).showDirectoryPicker({
            mode: "readwrite",
            startIn: "downloads",
          })

          // Create the file in the selected directory
          const fileHandle = await directoryHandle.getFileHandle(filename, {
            create: true,
          })

          const writable = await fileHandle.createWritable()
          await writable.write(blob)
          await writable.close()

          toast({
            title: "Saved to Folder",
            description: `PDF saved to the selected folder as ${filename}`,
          })
          setSavedToFolder(true)
          return true
        } catch (error) {
          // User cancelled or error occurred, fall back to regular download
          console.log("Directory picker cancelled or failed:", error)
        }
      }

      // Fallback: Regular download with suggested folder structure
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = filename

      // Add download attribute to suggest folder structure
      link.setAttribute("download", `Invoice Generator/${filename}`)

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)

      toast({
        title: "PDF Downloaded",
        description: `${filename} downloaded to your Downloads folder. Consider organizing it in an "Invoice Generator" folder.`,
      })
      setSavedToFolder(true)
      return true
    } catch (error) {
      console.error("Error saving PDF:", error)
      toast({
        title: "Save Failed",
        description: "Unable to save PDF to folder. Please try manual download.",
        variant: "destructive",
      })
      return false
    }
  }

  const generatePdf = async () => {
    if (!isClient) return

    try {
      setIsGenerating(true)

      // Validate data before generating PDF
      if (!invoiceData) {
        throw new Error("Invoice data is missing")
      }

      // Generate new sequential invoice number
      const invoiceNumber = InvoiceCounter.generateInvoiceNumber()

      // Add invoice number to invoice data
      const invoiceDataWithNumber = {
        ...invoiceData,
        invoiceNumber,
      }

      // Create PDF with validated data
      const pdfDoc = <InvoicePDF data={invoiceDataWithNumber} />
      const blob = await pdf(pdfDoc).toBlob()

      // Store the blob and create URL for sharing
      setPdfBlob(blob)
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)

      // Generate filename with invoice number and customer name
      const customerName = invoiceData.customerName || "Customer"
      const dateStr = format(invoiceData.date || new Date(), "yyyy-MM-dd")
      const filename = `${invoiceNumber}_${customerName.replace(/[^a-zA-Z0-9]/g, "_")}_${dateStr}.pdf`

      // Automatically save to Invoice Generator folder
      const saved = await saveToInvoiceFolder(blob, filename)

      // Update current invoice number display
      setCurrentInvoiceNumber(InvoiceCounter.getCurrentInvoiceNumber())

      if (saved) {
        toast({
          title: "Invoice Generated & Saved!",
          description: `Invoice ${invoiceNumber} has been generated and saved to the Invoice Generator folder.`,
        })
      } else {
        toast({
          title: "Invoice Generated!",
          description: `Invoice ${invoiceNumber} is ready. You can now download or share it.`,
        })
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const resetInvoiceCounter = () => {
    InvoiceCounter.resetCounter()
    setCurrentInvoiceNumber(InvoiceCounter.getCurrentInvoiceNumber())
    toast({
      title: "Counter Reset",
      description: "Invoice counter has been reset to 0001.",
    })
  }

  const openInvoiceFolder = async () => {
    try {
      if ("showDirectoryPicker" in window) {
        await (window as any).showDirectoryPicker({
          mode: "read",
          startIn: "downloads",
        })
        toast({
          title: "Folder Opened",
          description: "You can now view your saved invoices.",
        })
      } else {
        toast({
          title: "Feature Not Supported",
          description: "Your browser doesn't support folder access. Check your Downloads folder.",
        })
      }
    } catch (error) {
      toast({
        title: "Cannot Open Folder",
        description: "Please manually navigate to your Downloads/Invoice Generator folder.",
      })
    }
  }

  const downloadPdf = () => {
    if (!pdfUrl || !pdfBlob) return

    const customerName = invoiceData.customerName || "Customer"
    const dateStr = format(invoiceData.date || new Date(), "yyyy-MM-dd")
    const invoiceNumber = currentInvoiceNumber || "INV-0001"
    const filename = `${invoiceNumber}_${customerName.replace(/[^a-zA-Z0-9]/g, "_")}_${dateStr}.pdf`

    const link = document.createElement("a")
    link.href = pdfUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download Started",
      description: "Your invoice PDF is being downloaded.",
    })
  }

  const shareViaEmail = async () => {
    if (!pdfBlob) return

    try {
      const customerName = invoiceData.customerName || "Customer"
      const dateStr = format(invoiceData.date || new Date(), "yyyy-MM-dd")
      const invoiceNumber = currentInvoiceNumber || "INV-0001"
      const filename = `${invoiceNumber}_${customerName.replace(/[^a-zA-Z0-9]/g, "_")}_${dateStr}.pdf`

      // Create a File object from the blob
      const file = new File([pdfBlob], filename, {
        type: "application/pdf",
      })

      // Check if the browser supports the Web Share API with files
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Invoice ${invoiceNumber} - ${invoiceData.customerName || "Customer"}`,
          text: `Invoice ${invoiceNumber} for ${format(invoiceData.date || new Date(), "dd/MM/yyyy")} - Total: ${new Intl.NumberFormat(
            "en-IN",
            {
              style: "currency",
              currency: "INR",
            },
          ).format(invoiceData.total)}`,
          files: [file],
        })

        toast({
          title: "Shared Successfully",
          description: "Invoice PDF has been shared via email.",
        })
      } else {
        // Fallback: Create a mailto link and download the file
        const subject = `Invoice ${invoiceNumber} - ${format(invoiceData.date || new Date(), "dd/MM/yyyy")}`
        const body = `Dear ${invoiceData.customerName || "Customer"},

Please find the attached invoice for your recent purchase.

Invoice Details:
- Invoice Number: ${invoiceNumber}
- Date: ${format(invoiceData.date || new Date(), "dd MMMM yyyy")}
- Total Amount: ${new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(invoiceData.total)}

Thank you for your business!

Best regards,
MADE PRODUCT`

        // Download the PDF first
        downloadPdf()

        // Then open email client
        const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        window.open(mailtoLink, "_blank")

        toast({
          title: "Email Client Opened",
          description: "PDF downloaded. Please attach it to your email.",
        })
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast({
          title: "Sharing Failed",
          description: "Unable to share via email. PDF has been downloaded instead.",
          variant: "destructive",
        })
        downloadPdf()
      }
    }
  }

  const shareViaWhatsApp = async () => {
    if (!pdfBlob) return

    try {
      const customerName = invoiceData.customerName || "Customer"
      const dateStr = format(invoiceData.date || new Date(), "yyyy-MM-dd")
      const invoiceNumber = currentInvoiceNumber || "INV-0001"
      const filename = `${invoiceNumber}_${customerName.replace(/[^a-zA-Z0-9]/g, "_")}_${dateStr}.pdf`

      // Create a File object from the blob
      const file = new File([pdfBlob], filename, {
        type: "application/pdf",
      })

      // Check if the browser supports the Web Share API with files
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Invoice ${invoiceNumber} - ${invoiceData.customerName || "Customer"}`,
          text: `📄 Invoice PDF\n\nInvoice: ${invoiceNumber}\nCustomer: ${invoiceData.customerName || "Customer"}\nDate: ${format(
            invoiceData.date || new Date(),
            "dd/MM/yyyy",
          )}\nTotal: ${new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(invoiceData.total)}`,
          files: [file],
        })

        toast({
          title: "Shared Successfully",
          description: "Invoice PDF has been shared via WhatsApp.",
        })
      } else {
        // Fallback: Download PDF and open WhatsApp Web
        downloadPdf()

        const message = `📄 *Invoice PDF*

Invoice: ${invoiceNumber}
Customer: ${invoiceData.customerName || "Customer"}
Date: ${format(invoiceData.date || new Date(), "dd/MM/yyyy")}
Total: ${new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(invoiceData.total)}

Please find the invoice PDF in your downloads folder.`

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, "_blank")

        toast({
          title: "WhatsApp Opened",
          description: "PDF downloaded. Please attach it to your WhatsApp message.",
        })
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast({
          title: "Sharing Failed",
          description: "Unable to share via WhatsApp. PDF has been downloaded instead.",
          variant: "destructive",
        })
        downloadPdf()
      }
    }
  }

  const shareViaNativeAPI = async () => {
    if (!navigator.share || !pdfBlob) {
      toast({
        title: "Sharing Not Supported",
        description: "Your browser doesn't support native sharing.",
        variant: "destructive",
      })
      return
    }

    try {
      const customerName = invoiceData.customerName || "Customer"
      const dateStr = format(invoiceData.date || new Date(), "yyyy-MM-dd")
      const invoiceNumber = currentInvoiceNumber || "INV-0001"
      const filename = `${invoiceNumber}_${customerName.replace(/[^a-zA-Z0-9]/g, "_")}_${dateStr}.pdf`

      const file = new File([pdfBlob], filename, {
        type: "application/pdf",
      })

      // Check if files can be shared
      if (navigator.canShare && !navigator.canShare({ files: [file] })) {
        toast({
          title: "File Sharing Not Supported",
          description: "Your device doesn't support sharing PDF files.",
          variant: "destructive",
        })
        return
      }

      await navigator.share({
        title: `Invoice ${invoiceNumber}`,
        text: `Invoice ${invoiceNumber} for ${invoiceData.customerName || "Customer"} - ${new Intl.NumberFormat(
          "en-IN",
          {
            style: "currency",
            currency: "INR",
          },
        ).format(invoiceData.total)}`,
        files: [file],
      })

      toast({
        title: "Shared Successfully",
        description: "Invoice PDF has been shared via your selected app.",
      })
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast({
          title: "Sharing Failed",
          description: "Unable to share the PDF file. Please try downloading instead.",
          variant: "destructive",
        })
      }
    }
  }

  const copyPdfAsDataUrl = async () => {
    if (!pdfBlob) return

    try {
      // Convert blob to base64 data URL
      const reader = new FileReader()
      reader.onload = async () => {
        const dataUrl = reader.result as string

        try {
          await navigator.clipboard.writeText(dataUrl)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)

          toast({
            title: "PDF Data Copied",
            description: "PDF data URL copied to clipboard. You can paste this in supported applications.",
          })
        } catch (error) {
          toast({
            title: "Copy Failed",
            description: "Unable to copy PDF data. Please try downloading instead.",
            variant: "destructive",
          })
        }
      }
      reader.readAsDataURL(pdfBlob)
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to process PDF for copying.",
        variant: "destructive",
      })
    }
  }

  const sendViaMessenger = async () => {
    if (!pdfBlob) return

    try {
      const customerName = invoiceData.customerName || "Customer"
      const dateStr = format(invoiceData.date || new Date(), "yyyy-MM-dd")
      const invoiceNumber = currentInvoiceNumber || "INV-0001"
      const filename = `${invoiceNumber}_${customerName.replace(/[^a-zA-Z0-9]/g, "_")}_${dateStr}.pdf`

      // Create a File object from the blob
      const file = new File([pdfBlob], filename, {
        type: "application/pdf",
      })

      // Try to use Web Share API first
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Invoice ${invoiceNumber} - ${invoiceData.customerName || "Customer"}`,
          files: [file],
        })

        toast({
          title: "Shared Successfully",
          description: "Choose your preferred messaging app to send the PDF.",
        })
      } else {
        // Fallback: Download and provide instructions
        downloadPdf()

        toast({
          title: "PDF Downloaded",
          description: "Please manually attach the downloaded PDF to your message.",
        })
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        downloadPdf()
        toast({
          title: "Manual Sharing Required",
          description: "PDF downloaded. Please attach it manually to your message.",
        })
      }
    }
  }

  if (!isClient) {
    return (
      <Button className="w-full mt-4" disabled>
        Generate Invoice
      </Button>
    )
  }

  if (!pdfBlob) {
    return (
      <div className="space-y-2 mt-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Next Invoice Number:</span>
          <span className="font-mono font-bold">{currentInvoiceNumber}</span>
        </div>
        <div className="flex gap-2">
          <Button onClick={generatePdf} disabled={isGenerating} className="flex-1">
            {isGenerating ? "Generating PDF..." : "Generate & Save Invoice"}
          </Button>
          <Button variant="outline" size="icon" onClick={resetInvoiceCounter} title="Reset Counter">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-gray-500 text-center">
          Total Invoices Generated: {InvoiceCounter.getTotalInvoicesGenerated()}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={downloadPdf} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-1 sm:flex-initial">
              <Send className="h-4 w-4 mr-2" />
              Send PDF
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {navigator.share && (
              <>
                <DropdownMenuItem onClick={shareViaNativeAPI}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share PDF via Apps
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem onClick={shareViaEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Send via Email
            </DropdownMenuItem>

            <DropdownMenuItem onClick={shareViaWhatsApp}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Send via WhatsApp
            </DropdownMenuItem>

            <DropdownMenuItem onClick={sendViaMessenger}>
              <Send className="h-4 w-4 mr-2" />
              Send via Messenger
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={copyPdfAsDataUrl}>
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Copied!" : "Copy PDF Data"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {savedToFolder && (
        <Button variant="ghost" size="sm" onClick={openInvoiceFolder} className="text-sm">
          <FolderOpen className="h-4 w-4 mr-2" />
          Open Invoice Folder
        </Button>
      )}
    </div>
  )
}
