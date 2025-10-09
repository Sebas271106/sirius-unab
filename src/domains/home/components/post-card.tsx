"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react"
import Image from "next/image"

export interface PostCardProps {
  id: string
  author: string
  role: string
  avatar: string
  timestamp: string
  content: string
  likes: number
  comments: number
  media?: { url: string; mime_type: string }[]
  likedByMe?: boolean
  onToggleLike?: (postId: string) => void
  onShare?: (postId: string) => void
  onSubmitComment?: (postId: string, text: string) => void
  onToggleComment?: (postId: string) => void
  commentOpen?: boolean
  commentText?: string
  setCommentText?: (v: string) => void
  commentsList?: { id: string | number; author: string; avatar: string; timestamp: string; content: string }[]
  onOpenDetail?: (postId: string) => void
}

export function PostCard({ id, author, role, avatar, timestamp, content, likes, comments, media = [], likedByMe, onToggleLike, onShare, onSubmitComment, onToggleComment, commentOpen, commentText = "", setCommentText, commentsList = [], onOpenDetail }: PostCardProps) {
  return (
    <article className="bg-card rounded-2xl border hover:border-muted shadow-sm hover:shadow-md transition-shadow p-4 mb-0">
      <div className="flex gap-3">
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarImage src={avatar || "/placeholder.svg"} alt={author} />
          <AvatarFallback className="bg-[#ff9800] text-white text-sm">
            {author
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm hover:underline">{author}</span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-muted-foreground text-xs">{role}</span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-muted-foreground text-xs">{timestamp}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 hover:bg-muted/50">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          <p
            className="text-sm leading-relaxed mb-3 cursor-pointer"
            onClick={() => onOpenDetail && onOpenDetail(id)}
          >
            {content}
          </p>

          {media.length > 0 && (
            <div className="mb-3">
              <div
                className="inline-block rounded-2xl overflow-hidden border cursor-pointer max-w-[340px] md:max-w-[400px]"
                role="button"
                tabIndex={0}
                onClick={() => onOpenDetail && onOpenDetail(id)}
                onKeyDown={(e) => { if (e.key === 'Enter' && onOpenDetail) { onOpenDetail(id) } }}
              >
                {media.length === 1 ? (
              media[0].mime_type?.startsWith("image/") ? (
                <div className="w-full max-w-[340px] md:max-w-[400px]">
                  <div className="aspect-[4/5] md:aspect-square relative">
                    <Image src={media[0].url} alt="media-0" fill sizes="(max-width: 768px) 340px, 400px" className="object-cover" />
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-[340px] md:max-w-[400px]">
                  <div className="aspect-[4/5] md:aspect-square">
                    <video src={media[0].url} controls className="w-full h-full object-cover" />
                  </div>
                </div>
              )
            ) : (
              <div className="inline-grid grid-cols-2 gap-1 max-w-[340px] md:max-w-[400px]">
                {media.map((m, idx) => (
                  <div key={idx} className="relative overflow-hidden rounded-xl">
                    {m.mime_type.startsWith("image/") ? (
                      <div className="aspect-square relative">
                        <Image src={m.url} alt={`media-${idx}`} fill sizes="(max-width: 768px) 170px, 200px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-square">
                        <video src={m.url} controls className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-6 px-1">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-[#1d9bf0]" onClick={() => (onToggleComment ? onToggleComment(id) : (onOpenDetail && onOpenDetail(id)))}>
              <MessageCircle className="h-[18px] w-[18px]" />
              <span className="text-xs">{comments}</span>
            </button>
            <button
              className={`flex items-center gap-2 ${likedByMe ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
              aria-pressed={likedByMe}
              onClick={() => onToggleLike && onToggleLike(id)}
            >
              <Heart className="h-[18px] w-[18px]" {...(likedByMe ? { fill: "currentColor" } : {})} />
              <span className="text-xs">{likes}</span>
            </button>
            <button className="flex items-center gap-2 text-muted-foreground hover:text-[#00ba7c]" onClick={() => onShare && onShare(id)}>
              <Share2 className="h-[18px] w-[18px]" />
            </button>
            <button className="flex items-center gap-2 text-muted-foreground hover:text-[#ff9800]">
              <Bookmark className="h-[18px] w-[18px]" />
            </button>
          </div>

          {commentOpen && (
            <div className="mt-3">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText && setCommentText(e.target.value)}
                placeholder="Escribe un comentario..."
                className="min-h-[60px]"
              />
              <div className="mt-2 flex justify-end">
                <Button size="sm" disabled={!commentText?.trim()} onClick={() => onSubmitComment && onSubmitComment(id, commentText || "")}>Comentar</Button>
              </div>
              
              {/* Lista de comentarios */}
              {commentsList.length > 0 && (
                <div className="mt-3 space-y-3">
                  {commentsList.map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <Avatar className="h-7 w-7 flex-shrink-0">
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
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}