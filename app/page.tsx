import OrderForm from "@/components/order-form"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-24 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Invoice Generator</h1>
        <OrderForm />
      </div>
    </main>
  )
}
