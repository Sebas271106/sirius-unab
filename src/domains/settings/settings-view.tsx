"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Bell, Lock, User, Globe, Mail, Smartphone } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/../app/supabaseClient"
import { useToast } from "@/hooks/use-toast"

export default function SettingsView() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [assignmentReminders, setAssignmentReminders] = useState(true)
  const [gradeNotifications, setGradeNotifications] = useState(true)
  const [discussionUpdates, setDiscussionUpdates] = useState(false)

  // Seguridad
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loadingSecurity, setLoadingSecurity] = useState(false)

  // Datos reales del usuario
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [studentId, setStudentId] = useState("")
  const [loadingUser, setLoadingUser] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!supabase) {
          setLoadingUser(false)
          return
        }
        const { data: authData } = await supabase.auth.getUser()
        const user = authData.user
        if (!user) {
          setLoadingUser(false)
          return
        }
        const { data: profile, error } = await supabase
          .from("users")
          .select("full_name, id_number, email")
          .eq("id", user.id)
          .single()
        if (error) {
          console.warn("No se pudo cargar perfil desde users:", error.message)
        }
        const fullName = profile?.full_name || (user.user_metadata?.full_name as string) || ""
        const parts = fullName.trim().split(/\s+/)
        setFirstName(parts[0] || "")
        setLastName(parts.slice(1).join(" ") || "")
        setEmail(profile?.email || user.email || "")
        setStudentId(profile?.id_number || (user.user_metadata?.id_number as string) || "")
      } catch (err: any) {
        console.error("Error cargando usuario:", err?.message || err)
      } finally {
        setLoadingUser(false)
      }
    }
    loadUser()
  }, [])

  const handleSaveChanges = async () => {
    try {
      setLoadingUser(true)
      if (!supabase) {
        toast({ title: "Configuración requerida", description: "Faltan variables de entorno de Supabase" })
        setLoadingUser(false)
        return
      }
      const { data: authData } = await supabase.auth.getUser()
      const user = authData.user
      if (!user) {
        toast({ title: "No autenticado", description: "Debes iniciar sesión" })
        setLoadingUser(false)
        return
      }
      const full_name = `${firstName} ${lastName}`.trim()
      const { error } = await supabase
        .from("users")
        .update({ full_name })
        .eq("id", user.id)
      if (error) {
        toast({ title: "Error al guardar", description: error.message })
      } else {
        toast({ title: "Cambios guardados", description: "Tu información fue actualizada" })
      }
    } catch (err: any) {
      toast({ title: "Error inesperado", description: err?.message || "Intenta de nuevo" })
    } finally {
      setLoadingUser(false)
    }
  }

  const handleUpdatePassword = async () => {
    try {
      if (!supabase) {
        toast({ title: "Configuración requerida", description: "Faltan variables de entorno de Supabase" })
        return
      }
      setLoadingSecurity(true)

      if (!currentPassword || !newPassword) {
        toast({ title: "Datos incompletos", description: "Ingresa tu contraseña actual y la nueva" })
        setLoadingSecurity(false)
        return
      }
      if (newPassword.length < 8) {
        toast({ title: "Contraseña débil", description: "La nueva contraseña debe tener al menos 8 caracteres" })
        setLoadingSecurity(false)
        return
      }
      if (newPassword !== confirmPassword) {
        toast({ title: "No coinciden", description: "La confirmación no coincide con la nueva contraseña" })
        setLoadingSecurity(false)
        return
      }

      const { data: authData } = await supabase.auth.getUser()
      const user = authData.user
      if (!user) {
        toast({ title: "No autenticado", description: "Debes iniciar sesión" })
        setLoadingSecurity(false)
        return
      }

      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: currentPassword })
      if (signInErr) {
        toast({ title: "Contraseña actual incorrecta", description: signInErr.message })
        setLoadingSecurity(false)
        return
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        toast({ title: "Error al actualizar", description: error.message })
      } else {
        toast({ title: "Contraseña actualizada", description: "Tu contraseña fue actualizada correctamente" })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch (err: any) {
      toast({ title: "Error inesperado", description: err?.message || "Intenta de nuevo" })
    } finally {
      setLoadingSecurity(false)
    }
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#ff9800] dark:text-primary" />
                <CardTitle>Account Information</CardTitle>
              </div>
              <CardDescription>Update your personal information and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={loadingUser} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={loadingUser} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input id="studentId" value={studentId} disabled />
              </div>
              <Button onClick={handleSaveChanges} className="bg-[#ff9800] hover:bg-[#ff9800]/90 dark:bg-primary dark:hover:bg-primary/90" disabled={loadingUser}>
                {loadingUser ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#ff9800] dark:text-primary" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>Manage your password and security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={loadingSecurity || !supabase} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={loadingSecurity || !supabase} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loadingSecurity || !supabase} />
              </div>
              <Button className="bg-[#ff9800] hover:bg-[#ff9800]/90 dark:bg-primary dark:hover:bg-primary/90" onClick={handleUpdatePassword} disabled={loadingSecurity || !supabase}>
                {loadingSecurity ? "Actualizando..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#ff9800] dark:text-primary" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="emailNotif" className="cursor-pointer">
                      Email Notifications
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch id="emailNotif" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="pushNotif" className="cursor-pointer">
                      Push Notifications
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                </div>
                <Switch id="pushNotif" checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="assignmentRemind" className="cursor-pointer">
                    Assignment Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">Get reminders for upcoming assignments</p>
                </div>
                <Switch id="assignmentRemind" checked={assignmentReminders} onCheckedChange={setAssignmentReminders} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="gradeNotif" className="cursor-pointer">
                    Grade Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">Be notified when grades are posted</p>
                </div>
                <Switch id="gradeNotif" checked={gradeNotifications} onCheckedChange={setGradeNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="discussionUpdates" className="cursor-pointer">
                    Discussion Updates
                  </Label>
                  <p className="text-sm text-muted-foreground">Get notified about discussion replies</p>
                </div>
                <Switch id="discussionUpdates" checked={discussionUpdates} onCheckedChange={setDiscussionUpdates} />
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </>
  )
}