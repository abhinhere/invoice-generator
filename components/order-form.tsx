"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ThreeDElement } from "@/components/three-d-element"

// Define the item interface
interface OrderItem {
  id: string
  name: string
  quantity: number
  rate: number
}

export default function OrderForm() {
  const [customerName, setCustomerName] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [items, setItems] = useState<OrderItem[]>([{ id: "1", name: "", quantity: 1, rate: 0 }])
  const [discount, setDiscount] = useState(0)

  // Add a new item to the list
  const addItem = () => {
    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      name: "",
      quantity: 1,
      rate: 0,
    }
    setItems([...items, newItem])
  }

  // Remove an item from the list
  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  // Update an item in the list
  const updateItem = (id: string, field: keyof OrderItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value }
        }
        return item
      }),
    )
  }

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0)

  // Calculate discount amount
  const discountAmount = (subtotal * discount) / 100

  // Calculate total
  const total = subtotal - discountAmount

  // Format currency in Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Customer Name</Label>
              <Input
                id="customer-name"
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Items</h3>
              <Button onClick={addItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>

            <div className="flex items-center gap-3 p-3 text-sm font-medium text-gray-600 border-b">
              <div className="flex-1">Item Name</div>
              <div className="w-20 text-center">Qty</div>
              <div className="w-24 text-center">Rate (₹)</div>
              <div className="w-28 text-right">Total</div>
              <div className="w-10"></div>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(item.id, "name", e.target.value)}
                      placeholder="Item name"
                      className="border-0 bg-transparent p-0 focus-visible:ring-0"
                    />
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                      placeholder="Qty"
                      className="text-center"
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, "rate", Number.parseFloat(e.target.value) || 0)}
                      placeholder="Rate"
                      className="text-center"
                    />
                  </div>
                  <div className="w-28 text-right font-medium text-green-600">
                    {formatCurrency(item.quantity * item.rate)}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove item</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(Number.parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <div className="w-full flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="w-full flex justify-between text-sm">
            <span>Discount ({discount}%):</span>
            <span>- {formatCurrency(discountAmount)}</span>
          </div>
          <div className="w-full flex justify-between font-medium text-lg">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <Button className="w-full mt-4">Generate Invoice</Button>
        </CardFooter>
      </Card>

      <div className="h-[400px] lg:h-auto">
        <ThreeDElement />
      </div>
    </div>
  )
}
