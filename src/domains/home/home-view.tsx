"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/../app/supabaseClient"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PostCard } from "./components/post-card"
import { StoriesStrip } from "./components/stories-strip"
import { Composer } from "./components/composer"
import { PostDetailModal } from "./components/post-detail-modal"
import { Skeleton } from "@/components/ui/skeleton"

// PostCard ahora está modularizado en ./components/post-card
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

// StoriesStrip maneja internamente los stories
export default function HomeView() {
  const [posts, setPosts] = useState<Array<{id: string, author: string, role: string, avatar: string, timestamp: string, content: string, likes: number, comments: number, media?: { url: string; mime_type: string }[]}>>([])
  const [loading, setLoading] = useState<boolean>(true)
  const { toast } = useToast()
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set())
  const [openComments, setOpenComments] = useState<Set<string>>(new Set())
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({})
  const [commentsByPostId, setCommentsByPostId] = useState<Record<string, { id: string | number; author: string; avatar: string; timestamp: string; content: string }[]>>({})
  const [detailOpen, setDetailOpen] = useState<boolean>(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

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
      console.log("[HomeView] Posts obtenidos:", { count: (postsData || []).length, sample: (postsData || []).slice(0,3) })
      const authorIds = Array.from(new Set((postsData || []).map(p => p.author_id)))
      console.log("[HomeView] Author IDs para perfiles:", authorIds)
      const profilesById: Record<string, { id: string; full_name?: string | null; career?: string | null; email?: string | null }> = {}

      // 1) Intentar obtener perfiles desde API server-side (service role) para todos los autores
      if (authorIds.length > 0) {
        try {
          const res = await fetch('/api/user-profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: authorIds })
          })
          if (res.ok) {
            const { profiles } = await res.json()
            console.log("[HomeView] API perfiles recibidos:", { count: (profiles || []).length, ids: (profiles || []).map((p: { id: string })=>p.id) })
            for (const p of profiles || []) {
              profilesById[p.id] = { ...(profilesById[p.id] || {}), ...p }
            }
          } else {
            const txt = await res.text()
            console.warn("[HomeView] API /api/user-profiles no OK", { status: res.status, body: txt })
          }
        } catch (e) {
          console.error('Error obteniendo perfiles desde API:', e)
        }

        // 2) Merge adicional con lectura directa desde tabla public.users (cliente) para mejorar datos (full_name/career)
        try {
          const { data: profiles, error: profileErr } = await supabase
            .from("users")
            .select("id, full_name, career, email")
            .in("id", authorIds)
          if (profileErr) {
            console.error("Error cargando perfiles:", profileErr.message)
          } else {
            console.log("[HomeView] Perfiles cliente recibidos:", { count: (profiles || []).length, ids: (profiles || []).map((p: { id: string })=>p.id) })
            for (const prof of profiles || []) {
              profilesById[prof.id] = { ...(profilesById[prof.id] || {}), ...prof }
            }
          }
        } catch (e) {
          console.error('Error leyendo perfiles en cliente:', e)
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
          mediaByPostId = (mediaRows || []).reduce((acc: Record<string, { url: string; mime_type: string }[]>, m: { post_id: string | number; url: string; mime_type: string }) => {
            const key = String(m.post_id)
            acc[key] = acc[key] || []
            acc[key].push({ url: m.url, mime_type: m.mime_type })
            return acc
          }, {} as Record<string, { url: string; mime_type: string }[]>)
        }
      }

      // Calcular conteos reales de likes y comentarios
      const likesRows = postIds.length > 0 ? (await supabase
        .from("post_likes")
        .select("post_id")
        .in("post_id", postIds)).data || [] : []
      const commentsRows = postIds.length > 0 ? (await supabase
        .from("post_comments")
        .select("post_id")
        .in("post_id", postIds)).data || [] : []
      const likesCountByPost: Record<string, number> = {}
      const commentsCountByPost: Record<string, number> = {}
      for (const r of likesRows as { post_id: string | number }[]) {
        const k = String(r.post_id)
        likesCountByPost[k] = (likesCountByPost[k] || 0) + 1
      }
      for (const r of commentsRows as { post_id: string | number }[]) {
        const k = String(r.post_id)
        commentsCountByPost[k] = (commentsCountByPost[k] || 0) + 1
      }

      const mapped = (postsData || []).map(p => {
        const prof = profilesById[p.author_id] || {}
        const resolvedAuthor = prof.full_name || (prof.email ? String(prof.email).split("@")[0] : `unab-${String(p.author_id).slice(0,8)}`)
        if (!prof.full_name && !prof.email) {
          console.warn("[HomeView] Fallback alias en post", { post_id: p.id, author_id: p.author_id, alias: resolvedAuthor, profile: prof })
        }
        return {
          id: String(p.id),
          author: resolvedAuthor,
          role: prof.career || "",
          avatar: "",
          timestamp: formatRelativeTime(p.created_at),
          content: p.content,
          likes: likesCountByPost[String(p.id)] ?? (p.likes_count || 0),
          comments: commentsCountByPost[String(p.id)] ?? (p.comments_count || 0),
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
          
          const likedSet = new Set<string>((likedRows || []).map((r: { post_id: string | number }) => String(r.post_id)))
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
    console.log("[HomeView] Comentarios obtenidos:", { postId, count: (rows || []).length, sample: (rows || []).slice(0,3) })
    
    const authorIds = Array.from(new Set((rows || []).map(r => r.author_id)))
    console.log("[HomeView] Author IDs (comments):", authorIds)
    const profilesById: Record<string, { id: string; full_name?: string | null; email?: string | null }> = {}
    
    if (authorIds.length > 0) {
      // 1) API server-side primero
      try {
        const res = await fetch('/api/user-profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: authorIds })
        })
        if (res.ok) {
          const { profiles } = await res.json()
          console.log("[HomeView] API perfiles (comments) recibidos:", { count: (profiles || []).length, ids: (profiles || []).map((p: { id: string })=>p.id) })
          for (const p of profiles || []) {
            profilesById[p.id] = { ...(profilesById[p.id] || {}), ...p }
          }
        } else {
          const txt = await res.text()
          console.warn("[HomeView] API /api/user-profiles (comments) no OK", { status: res.status, body: txt })
        }
      } catch (e) {
        console.error('Error enriqueciendo perfiles (comments) desde API:', e)
      }

      // 2) Merge con lectura cliente de public.users para completar datos
      try {
        const { data: profs } = await supabase
          .from("users")
          .select("id, full_name, email")
          .in("id", authorIds)
        console.log("[HomeView] Perfiles cliente (comments) recibidos:", { count: (profs || []).length, ids: (profs || []).map((p: { id: string })=>p.id) })
        for (const p of profs || []) {
          profilesById[p.id] = { ...(profilesById[p.id] || {}), ...p }
        }
      } catch (e) {
        console.error('Error leyendo perfiles (comments) en cliente:', e)
      }
    }
    
    const mapped = (rows || []).map(r => {
      const name = profilesById[r.author_id]?.full_name || (profilesById[r.author_id]?.email ? String(profilesById[r.author_id].email).split("@")[0] : `unab-${String(r.author_id).slice(0,8)}`)
      if (!profilesById[r.author_id]?.full_name && !profilesById[r.author_id]?.email) {
        console.warn("[HomeView] Fallback alias en comentario", { post_id: postId, comment_id: r.id, author_id: r.author_id, alias: name, profile: profilesById[r.author_id] })
      }
      return {
        id: r.id,
        author: name,
        avatar: "",
        timestamp: formatRelativeTime(r.created_at),
        content: r.content,
      }
    })
    
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

  const openDetail = async (postId: string) => {
    setSelectedPostId(postId)
    setDetailOpen(true)
    if (!commentsByPostId[postId]) {
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
      const { data: me } = await supabase.from("users").select("full_name, email").eq("id", userId).single()
      const authorName = me?.full_name || (me?.email ? String(me.email).split("@")[0] : "Tú")
      
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
        const code = (error as { code?: string } | null)?.code
        if (code === "409") {
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
    } catch {
      toast({ title: "No se pudo compartir", description: "Intenta nuevamente" })
    }
  }

  return (
    <div className="mx-auto max-w-3xl min-h-screen">
      <div className="container">
        <main className="lg:border-x lg:border-border min-h-screen">
          {/* Tabs estilo X.com */}
          <div className="border-b border-border">
            <Tabs defaultValue="para-ti" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b h-auto p-0">
                <TabsTrigger value="para-ti" className="flex-1 py-3">Para ti</TabsTrigger>
                <TabsTrigger value="siguiendo" className="flex-1 py-3">Siguiendo</TabsTrigger>
              </TabsList>
              <TabsContent value="para-ti" className="p-0">
                <StoriesStrip />
              </TabsContent>
              <TabsContent value="siguiendo" className="p-4 text-sm text-muted-foreground">
                Próximamente.
              </TabsContent>
            </Tabs>
          </div>

          {/* Composer */}
          <Composer />

          {/* Posts Feed */}
          {loading ? (
            <div className="divide-y divide-border">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="py-3">
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="mt-2 h-4 w-3/4 max-w-[480px]" />
                      <Skeleton className="mt-2 h-4 w-2/3 max-w-[420px]" />
                      <div className="mt-3 inline-block max-w-[340px] md:max-w-[400px]">
                        <Skeleton className="w-full aspect-[4/5] md:aspect-square rounded-2xl" />
                      </div>
                      <div className="mt-3 flex gap-4">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                    onOpenDetail={openDetail}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {selectedPostId && (
        <PostDetailModal
          open={detailOpen}
          onOpenChange={setDetailOpen}
          post={posts.find(p => String(p.id) === String(selectedPostId))}
          commentsList={commentsByPostId[String(selectedPostId)] || []}
          commentText={commentTexts[String(selectedPostId)] || ""}
          setCommentText={(v) => setCommentTextFor(String(selectedPostId), v)}
          onSubmitComment={(pid, txt) => onSubmitComment(pid, txt)}
          onToggleLike={(pid) => onToggleLike(pid)}
        />
      )}

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
