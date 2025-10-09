"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus } from "lucide-react"

const stories = [
  { id: 1, name: "Your Story", avatar: "/placeholder.svg?height=40&width=40", isOwn: true },
  { id: 2, name: "Engineering", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 3, name: "Student Life", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 4, name: "Sports", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 5, name: "Library", avatar: "/placeholder.svg?height=40&width=40" },
]

export function StoriesStrip() {
  return (
    <div className="border-b border-border p-4">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {stories.map((story) => (
          <button key={story.id} className="flex flex-col items-center gap-1 flex-shrink-0 group">
            <div
              className={`relative ${
                (story as any).isOwn ? "ring-2 ring-[#ff9800]" : "ring-2 ring-muted hover:ring-[#ff9800]"
              } rounded-full p-0.5 transition-all`}
            >
              <Avatar className="h-14 w-14">
                <AvatarImage src={story.avatar || "/placeholder.svg"} alt={story.name} />
                <AvatarFallback>{story.name[0]}</AvatarFallback>
              </Avatar>
              {(story as any).isOwn && (
                <div className="absolute bottom-0 right-0 h-5 w-5 bg-[#ff9800] rounded-full flex items-center justify-center border-2 border-background">
                  <Plus className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <span className="text-xs text-center max-w-[64px] truncate">{story.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}