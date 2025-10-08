"use client"

import { useState } from "react"
import { Bold, Italic, List, ListOrdered, LinkIcon, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TextEditor({ value, onChange, placeholder }: TextEditorProps) {
  const [isFocused, setIsFocused] = useState(false)

  const insertFormatting = (before: string, after = "") => {
    const textarea = document.getElementById("editor-textarea") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange(newText)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  return (
    <div className={`border rounded-lg ${isFocused ? "border-[#ff9800]" : "border-border"} transition-colors`}>
      <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => insertFormatting("**", "**")}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => insertFormatting("*", "*")}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormatting("- ")}>
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormatting("1. ")}>
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => insertFormatting("[", "](url)")}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => insertFormatting("![alt](", ")")}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>
      <textarea
        id="editor-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full min-h-[200px] p-4 bg-transparent resize-none focus:outline-none text-sm text-foreground placeholder:text-muted-foreground"
      />
    </div>
  )
}
