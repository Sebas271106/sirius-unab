import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Sirius UNAB",
  description: "Modern university web application",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://unab.edu.co/wp-content/uploads/2022/09/cropped-favicon-naranja-32x32.png" sizes="32x32" />
        <link rel="icon" href="https://unab.edu.co/wp-content/uploads/2022/09/cropped-favicon-naranja-192x192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="https://unab.edu.co/wp-content/uploads/2022/09/cropped-favicon-naranja-180x180.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <Suspense fallback={<div>Loading...</div>}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange={false}>
            {children}
            <Toaster />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
