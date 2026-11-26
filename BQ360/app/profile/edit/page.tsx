import { demoProfile } from "@/lib/demo-data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile">
                <ArrowLeft className="w-5 h-5" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Edit Profile</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-0 bg-white/80 shadow-lg">
          <CardContent className="space-y-4 py-8">
            <p className="text-sm font-bold uppercase text-red-600">Perfil demo</p>
            <h2 className="text-2xl font-bold text-slate-800">{demoProfile.full_name}</h2>
            <p className="text-slate-600">{demoProfile.email} · {demoProfile.city}, {demoProfile.country}</p>
            <p className="text-slate-600">La edición real se habilitará cuando se integre el almacenamiento permanente.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
