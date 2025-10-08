"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/../app/supabaseClient"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Sparkles, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface PostCardProps {
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
  onToggleComment?: (postId: string) => void
  onSubmitComment?: (postId: string, text: string) => void
  commentOpen?: boolean
  commentText?: string
  setCommentText?: (v: string) => void
  commentsList?: { id: any; author: string; avatar: string; timestamp: string; content: string }[]
}

function PostCard({ id, author, role, avatar, timestamp, content, likes, comments, media = [], likedByMe, onToggleLike, onShare, onToggleComment, onSubmitComment, commentOpen, commentText = "", setCommentText, commentsList = [] }: PostCardProps) {
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

          <p className="text-sm leading-relaxed mb-3">{content}</p>

          {media.length > 0 && (
            <div className="mb-3">
              <div className="rounded-xl overflow-hidden border">
                {media.length === 1 ? (
              media[0].mime_type?.startsWith("image/") ? (
                <img src={media[0].url} alt="media-0" className="w-full h-auto max-h-[520px] object-contain" />
              ) : (
                <video src={media[0].url} controls className="w-full h-auto max-h-[520px]" />
              )
            ) : (
              <div className="grid grid-cols-2 gap-1">
                {media.map((m, idx) => (
                  <div key={idx} className="relative">
                    {m.mime_type.startsWith("image/") ? (
                      <img src={m.url} alt={`media-${idx}`} className="w-full h-auto max-h-[300px] object-cover" />
                    ) : (
                      <video src={m.url} controls className="w-full h-auto max-h-[300px] object-cover" />
                    )}
                  </div>
                ))}
              </div>
            )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-6 px-1">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-[#1d9bf0]" onClick={() => onToggleComment && onToggleComment(id)}>
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

const formatRelativeTime = (isoDate: string) => {
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return "ahora"
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay}d`
}

const stories = [
  { id: 1, name: "Your Story", avatar: "/placeholder.svg?height=40&width=40", isOwn: true },
  { id: 2, name: "Engineering", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 3, name: "Student Life", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 4, name: "Sports", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 5, name: "Library", avatar: "/placeholder.svg?height=40&width=40" },
]

export default function HomeView() {
  const [posts, setPosts] = useState<Array<{id: any, author: string, role: string, avatar: string, timestamp: string, content: string, likes: number, comments: number, media?: { url: string; mime_type: string }[]}>>([])
  const [loading, setLoading] = useState<boolean>(true)
  const { toast } = useToast()
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set())
  const [openComments, setOpenComments] = useState<Set<string>>(new Set())
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({})
  const [commentsByPostId, setCommentsByPostId] = useState<Record<string, { id: any; author: string; avatar: string; timestamp: string; content: string }[]>>({})

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true)
      const { data: postsData, error } = await supabase
        .from("posts")
        .select("id, content, created_at, author_id, likes_count, comments_count")
        .order("created_at", { ascending: false })
      if (error) {
        console.error("Error cargando posts:", error.message)
        setLoading(false)
        return
      }
      const authorIds = Array.from(new Set((postsData || []).map(p => p.author_id)))
      let profilesById: Record<string, any> = {}
      if (authorIds.length > 0) {
        const { data: profiles, error: profileErr } = await supabase
          .from("users")
          .select("id, full_name, career")
          .in("id", authorIds)
        if (profileErr) {
          console.error("Error cargando perfiles:", profileErr.message)
        } else {
          profilesById = (profiles || []).reduce((acc: any, prof: any) => {
            acc[prof.id] = prof
            return acc
          }, {})
        }
      }
      // Fetch media for posts
      const postIds = (postsData || []).map(p => p.id)
      let mediaByPostId: Record<string, { url: string; mime_type: string }[]> = {}
      if (postIds.length > 0) {
        const { data: mediaRows, error: mediaErr } = await supabase
          .from("post_media")
          .select("post_id, url, mime_type")
          .in("post_id", postIds)
        if (mediaErr) {
          console.error("Error cargando media:", mediaErr.message)
        } else {
          mediaByPostId = (mediaRows || []).reduce((acc: any, m: any) => {
            const key = m.post_id
            acc[key] = acc[key] || []
            acc[key].push({ url: m.url, mime_type: m.mime_type })
            return acc
          }, {})
        }
      }

      const mapped = (postsData || []).map(p => {
        const prof = profilesById[p.author_id] || {}
        return {
          id: p.id,
          author: prof.full_name || "Usuario",
          role: prof.career || "",
          avatar: "",
          timestamp: formatRelativeTime(p.created_at),
          content: p.content,
          likes: p.likes_count || 0,
          comments: p.comments_count || 0,
          media: mediaByPostId[p.id] || [],
        }
      })
      setPosts(mapped)
      
      // Cargar likes iniciales del usuario para estos posts
      try {
        const { data: authData } = await supabase.auth.getUser()
        const userId = authData.user?.id
        
        if (userId && postIds.length > 0) {
          const { data: likedRows } = await supabase
            .from("post_likes")
            .select("post_id")
            .eq("user_id", userId)
            .in("post_id", postIds)
          
          const likedSet = new Set<string>((likedRows || []).map((r: any) => String(r.post_id)))
          setLikedPostIds(likedSet)
        }
      } catch (e) {
        console.error("Error cargando likes iniciales:", e)
      }
      
      setLoading(false)
    }

    loadPosts()

    const onPostCreated = () => loadPosts()
    window.addEventListener("sirius:postCreated", onPostCreated as EventListener)

    const channel = supabase
      .channel("home-posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        () => loadPosts()
      )
      .subscribe()

    return () => {
      window.removeEventListener("sirius:postCreated", onPostCreated as EventListener)
      try { supabase.removeChannel(channel) } catch {}
    }
  }, [])

  const loadComments = async (postId: string) => {
    // Obtener últimos 10 comentarios y sus autores
    const { data: rows, error } = await supabase
      .from("post_comments")
      .select("id, content, created_at, author_id")
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(10)
    
    if (error) {
      console.error("Error cargando comentarios:", error.message)
      return
    }
    
    const authorIds = Array.from(new Set((rows || []).map(r => r.author_id)))
    let profilesById: Record<string, any> = {}
    
    if (authorIds.length > 0) {
      const { data: profs } = await supabase
        .from("users")
        .select("id, full_name")
        .in("id", authorIds)
      
      profilesById = (profs || []).reduce((acc: any, p: any) => { 
        acc[p.id] = p
        return acc 
      }, {})
    }
    
    const mapped = (rows || []).map(r => ({
      id: r.id,
      author: profilesById[r.author_id]?.full_name || "Usuario",
      avatar: "",
      timestamp: formatRelativeTime(r.created_at),
      content: r.content,
    }))
    
    setCommentsByPostId(prev => ({ ...prev, [postId]: mapped }))
  }

  const onToggleComment = async (postId: string) => {
    setOpenComments(prev => {
      const next = new Set(prev)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
    
    // Si se abre y no hay comentarios cargados, cargar
    if (!openComments.has(postId) && !commentsByPostId[postId]) {
      await loadComments(postId)
    }
  }

  const setCommentTextFor = (postId: string, v: string) => {
    setCommentTexts(prev => ({ ...prev, [postId]: v }))
  }

  const onSubmitComment = async (postId: string, text: string) => {
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData.user?.id
    if (!userId) {
      toast({ title: "Inicia sesión", description: "Necesitas iniciar sesión para comentar" })
      return
    }
    const body = text.trim()
    if (!body) return
    
    const { error } = await supabase.from("post_comments").insert({ post_id: postId, author_id: userId, content: body })
    if (error) {
      toast({ title: "Error", description: "No se pudo publicar tu comentario" })
      return
    }
    
    // Limpiar input y aumentar contador
    setCommentTexts(prev => ({ ...prev, [postId]: "" }))
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p))
    
    // Añadir el comentario al hilo visible inmediatamente
    try {
      const { data: me } = await supabase.from("users").select("full_name").eq("id", userId).single()
      const authorName = me?.full_name || "Tú"
      
      const newComment = { 
        id: Date.now(), // ID temporal hasta recargar
        author: authorName,
        avatar: "",
        timestamp: "ahora",
        content: body
      }
      
      setCommentsByPostId(prev => ({
        ...prev,
        [postId]: [newComment, ...(prev[postId] || [])]
      }))
    } catch (e) {
      console.error("Error obteniendo datos del autor:", e)
    }
    
    toast({ title: "Comentario publicado" })
  }

  const onToggleLike = async (postId: string) => {
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData.user?.id
    if (!userId) {
      toast({ title: "Inicia sesión", description: "Necesitas iniciar sesión para dar me gusta" })
      return
    }
    
    // Verificar estado real en servidor para evitar 409 (Conflict)
    const { count, error: checkErr } = await supabase
      .from("post_likes")
      .select("post_id", { count: "exact", head: true })
      .eq("post_id", postId)
      .eq("user_id", userId)
    
    if (checkErr) {
      toast({ title: "Error", description: "No se pudo verificar el me gusta" })
      return
    }
    
    const likedOnServer = (count || 0) > 0
    
    if (likedOnServer) {
      // Ya tiene like en el servidor, eliminar
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId)
      
      if (error) {
        toast({ title: "Error", description: "No se pudo quitar el me gusta" })
        return
      }
      
      setLikedPostIds(prev => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
      
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: Math.max((p.likes || 1) - 1, 0) } : p))
    } else {
      // No tiene like en el servidor, insertar
      const { error } = await supabase
        .from("post_likes")
        .insert({ post_id: postId, user_id: userId })
      
      if (error) {
        // Si hay conflicto (409), tratamos como ya-likeado
        if ((error as any).code === "409") {
          setLikedPostIds(prev => {
            const next = new Set(prev)
            next.add(postId)
            return next
          })
          return
        }
        
        toast({ title: "Error", description: "No se pudo dar me gusta" })
        return
      }
      
      setLikedPostIds(prev => {
        const next = new Set(prev)
        next.add(postId)
        return next
      })
      
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p))
    }
  }

  const onShare = async (postId: string) => {
    const url = `${window.location.origin}/?post=${postId}`
    try {
      if (navigator.share) {
        await navigator.share({ url, text: "Mira esta publicación de SIRIUS" })
        toast({ title: "Compartido", description: "Has compartido la publicación" })
      } else {
        await navigator.clipboard.writeText(url)
        toast({ title: "Enlace copiado", description: "URL copiada al portapapeles" })
      }
    } catch (e) {
      toast({ title: "No se pudo compartir", description: "Intenta nuevamente" })
    }
  }

  return (
    <div className="min-h-screen">
      <div className="container">
        <main className="border-x border-border min-h-screen">
          {/* Tabs estilo X.com */}
          <div className="border-b border-border">
            <Tabs defaultValue="para-ti" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b h-auto p-0">
                <TabsTrigger value="para-ti" className="flex-1 py-3">Para ti</TabsTrigger>
                <TabsTrigger value="siguiendo" className="flex-1 py-3">Siguiendo</TabsTrigger>
              </TabsList>
              <TabsContent value="para-ti" className="p-0">
                {/* Stories */}
                <div className="border-b border-border p-4">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {stories.map((story) => (
                      <button key={story.id} className="flex flex-col items-center gap-1 flex-shrink-0 group">
                        <div
                          className={`relative ${
                            story.isOwn ? "ring-2 ring-[#ff9800]" : "ring-2 ring-muted hover:ring-[#ff9800]"
                          } rounded-full p-0.5 transition-all`}
                        >
                          <Avatar className="h-14 w-14">
                            <AvatarImage src={story.avatar || "/placeholder.svg"} alt={story.name} />
                            <AvatarFallback>{story.name[0]}</AvatarFallback>
                          </Avatar>
                          {story.isOwn && (
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
              </TabsContent>
              <TabsContent value="siguiendo" className="p-4 text-sm text-muted-foreground">
                Próximamente.
              </TabsContent>
            </Tabs>
          </div>

          {/* Composer */}
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

          {/* Posts Feed */}
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Cargando publicaciones...</div>
          ) : posts.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No hay publicaciones aún. ¡Sé el primero!</div>
          ) : (
            <div className="divide-y divide-border">
              {posts.map((post) => (
                <div key={post.id} className="py-3">
                  <PostCard
                    {...post}
                    likedByMe={likedPostIds.has(String(post.id))}
                    onToggleLike={onToggleLike}
                    onShare={onShare}
                    onToggleComment={onToggleComment}
                    onSubmitComment={onSubmitComment}
                    commentOpen={openComments.has(String(post.id))}
                    commentText={commentTexts[String(post.id)] || ""}
                    setCommentText={(v) => setCommentTextFor(String(post.id), v)}
                    commentsList={commentsByPostId[String(post.id)] || []}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Floating Action Button */}
      <Button
        size="icon"
        className="fixed bottom-20 md:bottom-6 right-6 h-14 w-14 rounded-full bg-[#ff9800] hover:bg-[#fb8c00] shadow-xl hover:shadow-2xl transition-all hover:scale-110"
        onClick={() => window.dispatchEvent(new CustomEvent('sirius:openPostModal'))}
      >
        <Sparkles className="h-5 w-5" />
        <span className="sr-only">New post</span>
      </Button>
    </div>
  )
}
