"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreditCard } from "lucide-react"

export function StudentIdModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <CreditCard className="w-4 h-4" />
          Ver Carnet Estudiantil
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="relative">
          {/* Header with gradient */}
          <div className="relative h-32 bg-gradient-to-br from-[#ff9800] via-[#ff6f00] to-[#e65100]">
            <div
              className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 opacity-60"
              style={{ clipPath: "polygon(0 0, 60% 0, 40% 100%, 0 100%)" }}
            />
            <div className="absolute top-4 left-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-[#ffd54f] rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-[#ff9800]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L4 9v12h16V9l-8-6zm6 16h-3v-6H9v6H6v-9l6-4.5L18 10v9z" />
                </svg>
              </div>
              <div>
                <div className="text-white text-lg font-light">Universidad</div>
                <div className="text-[#ffd54f] text-2xl font-light -mt-1">unab</div>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="pt-0 pb-8 px-6 bg-background">
            <div className="flex flex-col items-center -mt-12">
              <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                <AvatarImage src="/placeholder.svg?height=96&width=96" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl text-foreground mt-4 mb-1">John Doe</h2>
              <p className="text-sm text-muted-foreground mb-1">ID: U00173523</p>
              <p className="text-sm text-muted-foreground mb-6">Carrera: Ingeniería de Sistemas</p>

              {/* QR Code */}
              <div className="w-32 h-32 bg-white p-2 rounded-lg border border-border shadow-sm">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <rect width="100" height="100" fill="white" />
                  <rect x="10" y="10" width="10" height="10" fill="black" />
                  <rect x="20" y="10" width="10" height="10" fill="black" />
                  <rect x="30" y="10" width="10" height="10" fill="black" />
                  <rect x="60" y="10" width="10" height="10" fill="black" />
                  <rect x="70" y="10" width="10" height="10" fill="black" />
                  <rect x="80" y="10" width="10" height="10" fill="black" />
                  <rect x="10" y="20" width="10" height="10" fill="black" />
                  <rect x="80" y="20" width="10" height="10" fill="black" />
                  <rect x="10" y="30" width="10" height="10" fill="black" />
                  <rect x="80" y="30" width="10" height="10" fill="black" />
                  <rect x="10" y="40" width="10" height="10" fill="black" />
                  <rect x="80" y="40" width="10" height="10" fill="black" />
                  <rect x="10" y="50" width="10" height="10" fill="black" />
                  <rect x="30" y="50" width="10" height="10" fill="black" />
                  <rect x="50" y="50" width="10" height="10" fill="black" />
                  <rect x="70" y="50" width="10" height="10" fill="black" />
                  <rect x="80" y="50" width="10" height="10" fill="black" />
                  <rect x="10" y="60" width="10" height="10" fill="black" />
                  <rect x="20" y="60" width="10" height="10" fill="black" />
                  <rect x="30" y="60" width="10" height="10" fill="black" />
                  <rect x="60" y="60" width="10" height="10" fill="black" />
                  <rect x="70" y="60" width="10" height="10" fill="black" />
                  <rect x="80" y="60" width="10" height="10" fill="black" />
                  <rect x="30" y="70" width="10" height="10" fill="black" />
                  <rect x="40" y="70" width="10" height="10" fill="black" />
                  <rect x="50" y="70" width="10" height="10" fill="black" />
                  <rect x="10" y="80" width="10" height="10" fill="black" />
                  <rect x="30" y="80" width="10" height="10" fill="black" />
                  <rect x="50" y="80" width="10" height="10" fill="black" />
                  <rect x="60" y="80" width="10" height="10" fill="black" />
                  <rect x="80" y="80" width="10" height="10" fill="black" />
                </svg>
              </div>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                Escanea este código para verificar identidad
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
