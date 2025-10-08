import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rutas que requieren autenticación del lado del servidor
const protectedRoutes = new Set<string>([
  "/home",
  "/bus",
  "/services",
  "/courses",
  "/profile",
  "/settings",
])

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const authCookie = req.cookies.get("sirius_auth")?.value
  const isLoggedIn = authCookie === "1"

  // Si accede al login y ya está autenticado, redirigir al home
  if (pathname === "/" && isLoggedIn) {
    const url = req.nextUrl.clone()
    url.pathname = "/home"
    return NextResponse.redirect(url)
  }

  // Proteger rutas: si no autenticado, enviar al login
  for (const route of protectedRoutes) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      if (!isLoggedIn) {
        const url = req.nextUrl.clone()
        url.pathname = "/"
        return NextResponse.redirect(url)
      }
      break
    }
  }

  // Continuar la request
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/home/:path*",
    "/bus/:path*",
    "/services/:path*",
    "/courses/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
}