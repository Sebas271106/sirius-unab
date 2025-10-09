"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "./supabaseClient"
import { careers } from "./careers"
import { toast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [idNumber, setIdNumber] = useState("")
  const [fullName, setFullName] = useState("")
  const [career, setCareer] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!supabase) {
      toast({ title: "Configuración requerida", description: "Faltan variables de entorno de Supabase" })
      setIsLoading(false)
      return
    }

    const domainOk = email.toLowerCase().endsWith("@unab.edu.co")
    if (!domainOk) {
      toast({ title: "Correo inválido", description: "Debes usar tu correo institucional @unab.edu.co" })
      setIsLoading(false)
      return
    }

    try {
      if (isRegister) {
        if (!idNumber || !fullName || !career) {
          toast({ title: "Faltan datos", description: "Completa ID, nombre y carrera" })
          setIsLoading(false)
          return
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { id_number: idNumber, full_name: fullName, career },
          },
        })
        if (error) {
          toast({ title: "Error al registrarse", description: error.message })
        } else {
          // Insertar perfil en tabla public.users (defensivo)
          const userId = data.user?.id
          if (userId) {
            const { error: insertErr } = await supabase
              .from("users")
              .upsert({ id: userId, id_number: idNumber, full_name: fullName, career, email }, { onConflict: "id" })
            if (insertErr) {
              console.error(insertErr)
            }
          }
          toast({ title: "Registro exitoso", description: "Te enviamos un correo de confirmación. Verifica tu bandeja de entrada y spam." })
          // No redirigir: permanecer en la página de login hasta que confirme el correo
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          toast({ title: "Error de inicio de sesión", description: error.message })
        } else {
          // Validar confirmación de correo antes de permitir el acceso
          const { data: userData } = await supabase.auth.getUser()
          const confirmed = !!userData.user?.email_confirmed_at
          if (!confirmed) {
            await supabase.auth.signOut()
            toast({ title: "Correo no verificado", description: "Debes confirmar tu correo antes de ingresar. Revisa tu email." })
          } else {
            try { document.cookie = "sirius_auth=1; Path=/; Max-Age=2592000" } catch {}
            toast({ title: "Bienvenido", description: "Inicio de sesión correcto" })
            window.location.href = "/home"
          }
        }
      }
    } catch (err: any) {
      toast({ title: "Error inesperado", description: err?.message ?? "Intenta de nuevo" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <img src="logo.png" alt="Logo UNAB" className="w-52 mx-auto"/>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-light">{isRegister ? "Crear Cuenta" : "Iniciar Sesión"}</CardTitle>
            <CardDescription>{isRegister ? "Regístrate con tu correo institucional @unab.edu.co" : "Ingresa tu correo institucional y contraseña"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="space-y-2">
                  <Label htmlFor="id">ID</Label>
                  <Input id="id" type="text" placeholder="Tu ID" required={isRegister} value={idNumber} onChange={(e) => setIdNumber(e.target.value)} className="h-11" />
                </div>
              )}
              {isRegister && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input id="fullName" type="text" placeholder="Tu nombre" required={isRegister} value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Correo institucional</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu.usuario@unab.edu.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              {isRegister && (
                <div className="space-y-2">
                  <Label>Carrera</Label>
                  <Select value={career} onValueChange={setCareer}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona tu carrera" />
                    </SelectTrigger>
                    <SelectContent>
                      {careers.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Mantener sesión iniciada
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {isRegister ? "Creando cuenta..." : "Iniciando sesión..."}
                  </div>
                ) : (
                  isRegister ? "Registrarse" : "Iniciar Sesión"
                )}
              </Button>
            </form>

            {/* Social login removido por ahora */}

            {/* Toggle Register/Login */}
            <div className="mt-6 text-center text-sm">
              {isRegister ? (
                <>
                  <span className="text-muted-foreground">¿Ya tienes una cuenta? </span>
                  <button type="button" className="text-primary hover:underline font-normal" onClick={() => setIsRegister(false)}>
                    Inicia sesión
                  </button>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground">¿No tienes una cuenta? </span>
                  <button type="button" className="text-primary hover:underline font-normal" onClick={() => setIsRegister(true)}>
                    Regístrate aquí
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground space-y-2">
          <p>
            Al iniciar sesión, aceptas nuestros{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Términos de Servicio
            </Link>{" "}
            y{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Política de Privacidad
            </Link>
          </p>
          <p>© 2025 Universidad UNAB. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}
