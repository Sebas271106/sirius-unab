"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle } from "lucide-react"
import Image from "next/image"

export interface DetailPost {
  id: string
  author: string
  role: string
  avatar: string
  timestamp: string
  content: string
  likes: number
  comments: number
  media?: { url: string; mime_type: string }[]
}

interface PostDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  post?: DetailPost
  commentsList: { id: string | number; author: string; avatar: string; timestamp: string; content: string }[]
  commentText: string
  setCommentText: (v: string) => void
  onSubmitComment: (postId: string, text: string) => Promise<void> | void
  onToggleLike: (postId: string) => Promise<void> | void
}

export function PostDetailModal({ open, onOpenChange, post, commentsList, commentText, setCommentText, onSubmitComment, onToggleLike }: PostDetailModalProps) {
  if (!post) return null

  const isSingleMedia = (post.media || []).length === 1
  const firstMedia = (post.media || [])[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1200px] p-0 sm:p-0 bg-background">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full h-full">
          {/* Left: media or big text */}
          <div className="p-0 md:p-0 border-r md:border-border max-h-[80vh] md:max-h-[85vh] overflow-hidden flex items-center justify-center">
            {(post.media && post.media.length > 0) ? (
              isSingleMedia ? (
                firstMedia?.mime_type?.startsWith("image/") ? (
                  <Image src={firstMedia.url} alt="post-media" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" />
                ) : (
                  <video src={firstMedia?.url} controls className="w-full h-full" />
                )
              ) : (
                <div className="grid grid-cols-2 gap-1 w-full h-full p-1">
                  {(post.media || []).map((m, idx) => (
                    <div key={idx} className="relative">
                      {m.mime_type.startsWith("image/") ? (
                        <Image src={m.url} alt={`media-${idx}`} fill sizes="(max-width: 768px) 50vw, 600px" className="object-cover" />
                      ) : (
                        <video src={m.url} controls className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center p-8">
                <div className="max-w-xl">
                  <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap">{post.content}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: header, actions, comments */}
          <div className="flex flex-col max-h-[80vh] md:max-h-[85vh]">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.author} />
                  <AvatarFallback className="bg-[#ff9800] text-white">
                    {post.author.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{post.author}</span>
                    {post.role ? <span className="text-muted-foreground text-xs">· {post.role}</span> : null}
                  </div>
                  <span className="text-muted-foreground text-xs">{post.timestamp}</span>
                </div>
              </div>
            </div>

            {/* Content for text-only duplicated for clarity on small screens */}
            {(!post.media || post.media.length === 0) && (
              <div className="p-4 border-b border-border">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>
            )}

            {/* Actions */}
            <div className="p-3 border-b border-border flex items-center gap-6">
              <button
                className={`flex items-center gap-2 ${post ? "text-muted-foreground hover:text-red-500" : "text-muted-foreground"}`}
                onClick={() => onToggleLike(post.id)}
              >
                <Heart className="h-[18px] w-[18px]" />
                <span className="text-xs">{post.likes}</span>
              </button>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="h-[18px] w-[18px]" />
                <span className="text-xs">{post.comments}</span>
              </div>
            </div>

            {/* Comments area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {commentsList.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sé el primero en comentar.</p>
              ) : (
                commentsList.map((c) => (
                  <div key={c.id} className="flex gap-2">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={c.avatar || "/placeholder.svg"} alt={c.author} />
                      <AvatarFallback className="bg-[#ff9800] text-white text-[10px]">
                        {c.author.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{c.author}</span>
                        <span className="text-[11px] text-muted-foreground">{c.timestamp}</span>
                      </div>
                      <p className="text-[13px] mt-0.5">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Composer */}
            <div className="p-4 border-t border-border">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escribe un comentario..."
                className="min-h-[60px]"
              />
              <div className="mt-2 flex justify-end">
                <Button size="sm" disabled={!commentText?.trim()} onClick={() => onSubmitComment(post.id, commentText)}>Comentar</Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}