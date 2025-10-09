"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Composer() {
  return (
    <div className="border-b border-border p-3">
      <div className="flex gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="You" />
          <AvatarFallback className="bg-[#ff9800] text-white text-xs">UN</AvatarFallback>
        </Avatar>
        <button onClick={() => window.dispatchEvent(new CustomEvent('sirius:openPostModal'))} className="flex-1 text-left px-3 py-2 rounded-full bg-muted hover:bg-accent transition-colors text-muted-foreground text-sm">
          ¿Qué está pasando en la UNAB?
        </button>
      </div>
    </div>
  )
}