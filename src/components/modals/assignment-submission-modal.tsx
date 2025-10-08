"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TextEditor } from "@/components/editors/text-editor"
import { Upload, X, FileText, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AssignmentSubmissionModalProps {
  isOpen: boolean
  onClose: () => void
  assignment: {
    id: number
    title: string
    description: string
    due: string
  }
}

export function AssignmentSubmissionModal({ isOpen, onClose, assignment }: AssignmentSubmissionModalProps) {
  const [submissionText, setSubmissionText] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)])
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
    setTimeout(() => {
      onClose()
      setIsSubmitted(false)
      setSubmissionText("")
      setFiles([])
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{assignment.title}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">{assignment.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              Due: {new Date(assignment.due).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" })}
            </Badge>
          </div>
        </DialogHeader>

        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="w-16 h-16 text-[#ff9800] mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Assignment Submitted!</h3>
            <p className="text-sm text-muted-foreground">Your work has been submitted successfully.</p>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Your Response</label>
              <TextEditor
                value={submissionText}
                onChange={setSubmissionText}
                placeholder="Write your assignment response here..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Attach Files</label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-[#ff9800] transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.zip,.jpg,.png"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-foreground mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PDF, DOC, TXT, ZIP, or images (max 10MB)</p>
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#ff9800]" />
                        <div>
                          <p className="text-sm text-foreground">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || (!submissionText && files.length === 0)}
                className="bg-[#ff9800] hover:bg-[#ff9800]/90 text-white"
              >
                {isSubmitting ? "Submitting..." : "Submit Assignment"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
