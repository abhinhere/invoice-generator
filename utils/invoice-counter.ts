"use client"

// Invoice counter utility for generating sequential invoice numbers
class InvoiceCounter {
  private static readonly STORAGE_KEY = "invoice_generator_counter"
  private static readonly PREFIX = "INV"

  // Get the current counter value from localStorage
  private static getCurrentCounter(): number {
    if (typeof window === "undefined") return 1

    const stored = localStorage.getItem(this.STORAGE_KEY)
    return stored ? Number.parseInt(stored, 10) : 1
  }

  // Increment and save the counter
  private static incrementCounter(): number {
    const current = this.getCurrentCounter()
    const next = current + 1
    localStorage.setItem(this.STORAGE_KEY, next.toString())
    return current
  }

  // Generate the next invoice number
  static generateInvoiceNumber(): string {
    const counter = this.incrementCounter()
    const year = new Date().getFullYear()
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0")

    // Format: INV-YYYY-MM-XXXX (e.g., INV-2024-12-0001)
    return `${this.PREFIX}-${year}-${month}-${counter.toString().padStart(4, "0")}`
  }

  // Get the current counter without incrementing (for preview)
  static getCurrentInvoiceNumber(): string {
    const counter = this.getCurrentCounter()
    const year = new Date().getFullYear()
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0")

    return `${this.PREFIX}-${year}-${month}-${counter.toString().padStart(4, "0")}`
  }

  // Reset counter (for testing or new year)
  static resetCounter(): void {
    localStorage.setItem(this.STORAGE_KEY, "1")
  }

  // Get total invoices generated
  static getTotalInvoicesGenerated(): number {
    return this.getCurrentCounter() - 1
  }

  // Set counter to specific value (for migration or setup)
  static setCounter(value: number): void {
    localStorage.setItem(this.STORAGE_KEY, value.toString())
  }
}

export default InvoiceCounter
