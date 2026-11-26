import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateGroupPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/groups">
                <ArrowLeft className="w-5 h-5" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Create New Group</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-0 bg-white/80 shadow-lg"><CardContent className="py-8 text-center space-y-3"><p className="text-sm font-bold uppercase text-red-600">Modo demostración</p><h2 className="text-xl font-bold text-slate-800">Creación disponible próximamente</h2><p className="text-slate-600">Por ahora puedes explorar las comunidades incluidas en los datos demo.</p></CardContent></Card>
      </main>
    </div>
  )
}
