"use client"

import React from "react"
import { Mail, Calendar, BookOpen, Award, Trash2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentIdModal } from "@/components/modals/student-id-modal"

const stats = [
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
  const [posts, setPosts] = React.useState<Array<{ id: string, content: string, created_at: string, media: { url: string; mime_type: string }[] }>>([])
  const [loading, setLoading] = React.useState<boolean>(false)

  React.useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { supabase } = await import("@/../app/supabaseClient")
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
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
      const mapped = (postRows || []).map(p => ({
        id: p.id,
        content: p.content,
        created_at: p.created_at,
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

  if (loading) return <div className="text-sm text-muted-foreground">Cargando...</div>
  if (posts.length === 0) return <div className="text-sm text-muted-foreground">Aún no tienes publicaciones.</div>

  return (
    <div className="divide-y divide-border">
      {posts.map(post => (
        <div key={post.id} className="py-3">
          <article className="bg-card rounded-2xl border hover:border-muted shadow-sm hover:shadow-md transition-shadow p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="text-xs text-muted-foreground">{formatRelativeTime(post.created_at)}</div>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleDeletePost(post.id)}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Eliminar</span>
              </Button>
            </div>
            <p className="text-sm mb-3 whitespace-pre-wrap break-words">{post.content}</p>
            {post.media.length > 0 && (
              <div className="mb-3">
                <div className="rounded-xl overflow-hidden border">
                  {post.media.length === 1 ? (
                    post.media[0].mime_type?.startsWith("image/") ? (
                      <img src={post.media[0].url} alt="media" className="w-full h-auto max-h-[520px] object-contain" />
                    ) : (
                      <video src={post.media[0].url} controls className="w-full h-auto max-h-[520px]" />
                    )
                  ) : (
                    <div className="grid grid-cols-2 gap-1">
                      {post.media.map((m, idx) => (
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
          </article>
        </div>
      ))}
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
