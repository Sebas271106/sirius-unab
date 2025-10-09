"use client"

import React from "react"
import { Mail, Calendar, BookOpen, Award, Trash2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentIdModal } from "@/components/modals/student-id-modal"
import { PostCard } from "../home/components/post-card"
import { Skeleton } from "@/components/ui/skeleton"
import { PostDetailModal } from "../home/components/post-detail-modal"

export const stats = [
  { label: "Courses Enrolled", value: "4", icon: BookOpen },
  { label: "Assignments Completed", value: "28", icon: Award },
  { label: "Average Grade", value: "88%", icon: Award },
]

const recentActivity = [
  { action: "Submitted assignment", course: "Advanced Algorithms", time: "2 hours ago" },
  { action: "Posted in discussion", course: "Linear Algebra", time: "1 day ago" },
  { action: "Completed quiz", course: "Technical Writing", time: "2 days ago" },
]

function ProfileSharedPosts() {
  return (
    <div className="text-sm text-muted-foreground">Compartidas próximamente.</div>
  )
}

function ProfileMyPosts() {
  const [posts, setPosts] = React.useState<Array<{ id: string; author: string; role: string; avatar: string; timestamp: string; content: string; likes: number; comments: number; media: { url: string; mime_type: string }[] }>>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  // Estado para detalle y comentarios
  const [commentsByPostId, setCommentsByPostId] = React.useState<Record<string, { id: string | number; author: string; avatar: string; timestamp: string; content: string }[]>>({})
  const [commentTexts, setCommentTexts] = React.useState<Record<string, string>>({})
  const [selectedPostId, setSelectedPostId] = React.useState<string | null>(null)
  const [detailOpen, setDetailOpen] = React.useState<boolean>(false)
  const [likedPostIds, setLikedPostIds] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { supabase } = await import("@/../app/supabaseClient")
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // Datos del autor para PostCard
      let authorName = "Tú"
      let role = ""
      try {
        const { data: profile } = await supabase
          .from("users")
          .select("full_name, career, email")
          .eq("id", user.id)
          .single()
        authorName = profile?.full_name || (profile?.email ? String(profile.email).split("@")[0] : "Tú")
        role = profile?.career || ""
      } catch {}

      const { data: postRows, error } = await supabase
        .from("posts")
        .select("id, content, created_at")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false })
      if (error) {
        console.error("Error cargando mis posts:", error.message)
        setLoading(false)
        return
      }
      const postIds = (postRows || []).map(p => p.id)

      // Media por post
      let mediaByPostId: Record<string, { url: string; mime_type: string }[]> = {}
      if (postIds.length > 0) {
        const { data: mediaRows, error: mediaErr } = await supabase
          .from("post_media")
          .select("post_id, url, mime_type")
          .in("post_id", postIds)
        if (mediaErr) {
          console.error("Error cargando media:", mediaErr.message)
        } else {
          mediaByPostId = (mediaRows || []).reduce(
            (
              acc: Record<string, { url: string; mime_type: string }[]>,
              m: { post_id: string | number; url: string; mime_type: string }
            ) => {
              const key = String(m.post_id)
              acc[key] = acc[key] || []
              acc[key].push({ url: m.url, mime_type: m.mime_type })
              return acc
            },
            {}
          )
        }
      }

      // Conteos de likes y comentarios
      const likesRows = postIds.length > 0 ? (await supabase
        .from("post_likes")
        .select("post_id, user_id")
        .in("post_id", postIds)).data || [] : []
      const commentsRows = postIds.length > 0 ? (await supabase
        .from("post_comments")
        .select("post_id")
        .in("post_id", postIds)).data || [] : []
      const likesCountByPost: Record<string, number> = {}
      const commentsCountByPost: Record<string, number> = {}
      for (const r of (likesRows as Array<{ post_id: string | number }>)) {
        const k = String(r.post_id)
        likesCountByPost[k] = (likesCountByPost[k] || 0) + 1
      }
      for (const r of (commentsRows as Array<{ post_id: string | number }>)) {
        const k = String(r.post_id)
        commentsCountByPost[k] = (commentsCountByPost[k] || 0) + 1
      }
      const likedByMeSet = new Set<string>()
      for (const r of (likesRows as Array<{ post_id: string | number; user_id?: string | number }>)) {
        if (String(r.user_id) === String(user.id)) {
          likedByMeSet.add(String(r.post_id))
        }
      }
      setLikedPostIds(likedByMeSet)

      const mapped = (postRows || []).map(p => ({
        id: String(p.id),
        author: authorName,
        role,
        avatar: "",
        timestamp: formatRelativeTime(p.created_at),
        content: p.content,
        likes: likesCountByPost[String(p.id)] ?? 0,
        comments: commentsCountByPost[String(p.id)] ?? 0,
        media: mediaByPostId[p.id] || [],
      }))
      setPosts(mapped)
      setLoading(false)
    }
    load()
  }, [])

  const formatRelativeTime = (iso: string) => {
    const date = new Date(iso)
    const diff = Date.now() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "ahora"
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} h`
    const days = Math.floor(hours / 24)
    return `${days} d`
  }

  const handleDeletePost = async (id: string) => {
    const { supabase } = await import("@/../app/supabaseClient")
    try {
      const { data: mediaRows } = await supabase
        .from("post_media")
        .select("storage_path")
        .eq("post_id", id)
      const paths = (mediaRows || []).map(m => m.storage_path)
      if (paths.length > 0) {
        try { await supabase.storage.from("posts").remove(paths) } catch (e) { console.warn(e) }
      }
      const { error } = await supabase.from("posts").delete().eq("id", id)
      if (error) { console.error("Error eliminando post:", error.message); return }
      setPosts(prev => prev.filter(p => p.id !== id))
      try { window.dispatchEvent(new CustomEvent("sirius:postCreated")) } catch {}
    } catch (e) {
      console.error(e)
    }
  }

  const loadComments = async (postId: string) => {
    const { supabase } = await import("@/../app/supabaseClient")
    const { data: rows, error } = await supabase
      .from("post_comments")
      .select("id, content, created_at, author_id")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
    if (error) { console.error("Error cargando comentarios:", error.message); return }
    const authorIds = (rows || []).map(r => r.author_id).filter(Boolean)
    const usersMap: Record<string, { full_name?: string; email?: string; avatar_url?: string }> = {}
    if (authorIds.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("id, full_name, email, avatar_url")
        .in("id", authorIds)
      for (const u of (users || [])) {
        usersMap[String(u.id)] = { full_name: u.full_name, email: u.email ?? undefined, avatar_url: (u as { avatar_url?: string }).avatar_url }
      }
    }
    const mapped = (rows || []).map((r: { id: string | number; content: string; created_at: string; author_id: string | number }) => {
      const u = usersMap[String(r.author_id)]
      const name = u?.full_name || (u?.email ? String(u.email).split("@")[0] : "Usuario")
      return {
        id: r.id,
        author: name,
        avatar: u?.avatar_url || "",
        timestamp: formatRelativeTime(r.created_at),
        content: r.content,
      }
    })
    setCommentsByPostId(prev => ({ ...prev, [postId]: mapped }))
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
    const { supabase } = await import("@/../app/supabaseClient")
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from("post_comments")
      .insert({ post_id: postId, author_id: user.id, content: text })
    if (error) { console.error("Error comentando:", error.message); return }
    setCommentTexts(prev => ({ ...prev, [postId]: "" }))
    await loadComments(postId)
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p))
  }

  const onToggleLike = async (postId: string) => {
    const { supabase } = await import("@/../app/supabaseClient")
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const hasLike = likedPostIds.has(postId)
    if (hasLike) {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id)
      if (error) { console.error("Error quitando like:", error.message) }
      setLikedPostIds(prev => { const next = new Set(prev); next.delete(postId); return next })
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: Math.max(0, (p.likes || 0) - 1) } : p))
    } else {
      const { error } = await supabase
        .from("post_likes")
        .insert({ post_id: postId, user_id: user.id })
      if (error) { console.error("Error dando like:", error.message) }
      setLikedPostIds(prev => { const next = new Set(prev); next.add(postId); return next })
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p))
    }
  }

  if (loading) {
    return (
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
    )
  }

  if (posts.length === 0) return <div className="text-sm text-muted-foreground">Aún no tienes publicaciones.</div>

  return (
    <div className="divide-y divide-border">
      {posts.map(post => (
        <div key={post.id} className="py-3">
          <div className="flex items-start justify-end mb-2">
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleDeletePost(post.id)}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Eliminar</span>
            </Button>
          </div>
          <PostCard
            {...post}
            likedByMe={likedPostIds.has(String(post.id))}
            onToggleLike={onToggleLike}
            onOpenDetail={openDetail}
          />
        </div>
      ))}

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
    </div>
  )
}

export default function ProfilePage() {
  const [fullName, setFullName] = React.useState<string | null>(null)
  const [email, setEmail] = React.useState<string | null>(null)
  const [career, setCareer] = React.useState<string | null>(null)
  const [joined, setJoined] = React.useState<string | null>(null)
  const [initials, setInitials] = React.useState<string>("US")

  React.useEffect(() => {
    const load = async () => {
      if (typeof window !== "undefined") {
        try {
          const cache = JSON.parse(localStorage.getItem("sirius_user") || "null")
          if (cache) {
            setFullName(cache.fullName ?? null)
            setEmail(cache.email ?? null)
            setCareer(cache.career ?? null)
            setInitials(cache.initials ?? "US")
          }
        } catch {}
      }
      const { supabase } = await import("@/../app/supabaseClient")
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const em = user.email ?? null
        let name = (user.user_metadata?.full_name as string) || null
        let car = (user.user_metadata?.career as string) || null
        let joinedAt = user.created_at ?? null
        try {
          const { data: profile } = await supabase
            .from("users")
            .select("full_name, career, created_at")
            .eq("id", user.id)
            .single()
          if (profile) {
            name = profile.full_name ?? name
            car = profile.career ?? car
            joinedAt = profile.created_at ?? joinedAt
          }
        } catch {}
        setEmail(em)
        setFullName(name)
        setCareer(car)
        setJoined(joinedAt ? new Date(joinedAt).toISOString().slice(0, 10) : null)
        const init = name
          ? name.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase()
          : em
          ? em.slice(0, 2).toUpperCase()
          : "US"
        setInitials(init)
      }
    }
    load()
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src="/placeholder.svg?height=96&width=96" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl text-foreground mb-2">{fullName ?? "Usuario"}</h1>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{career ?? "Estudiante"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{email ?? "correo@unab.edu.co"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{joined ? `Registrado: ${joined}` : ""}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <StudentIdModal />
              <Button variant="outline">Editar perfil</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs estilo X.com */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b h-auto p-0">
              <TabsTrigger value="posts" className="flex-1 py-3">Posts</TabsTrigger>
              <TabsTrigger value="shared" className="flex-1 py-3">Compartidas</TabsTrigger>
              <TabsTrigger value="replies" className="flex-1 py-3">Respuestas</TabsTrigger>
              <TabsTrigger value="activity" className="flex-1 py-3">Recent Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="posts" className="p-4">
              <ProfileMyPosts />
            </TabsContent>
            <TabsContent value="shared" className="p-4">
              <ProfileSharedPosts />
            </TabsContent>
            <TabsContent value="replies" className="p-4 text-sm text-muted-foreground">
              Próximamente.
            </TabsContent>
            <TabsContent value="activity" className="p-4">
              <div className="divide-y divide-border">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="py-3 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.course}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
