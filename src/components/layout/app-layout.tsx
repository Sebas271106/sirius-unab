"use client";

import type React from "react";
// Link import removed
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Bus,
  Grid3x3,
  BookOpen,
  User,
  Moon,
  Sun,
  LogOut,
  Settings,
} from "lucide-react";
import { useEffect, useContext, useState } from "react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ViewContext } from "@/components/context/view-context";
import { supabase } from "@/../app/supabaseClient";
import { PostModal } from "@/components/modals/post-modal";

const navItems = [
  { href: "/home", view: "home" as const, label: "Home", icon: Home },
  { href: "/bus", view: "bus" as const, label: "Bus", icon: Bus },
  {
    href: "/services",
    view: "services" as const,
    label: "Services",
    icon: Grid3x3,
  },
  {
    href: "/courses",
    view: "courses" as const,
    label: "Courses",
    icon: BookOpen,
  },
  { href: "/profile", view: "profile" as const, label: "Perfil", icon: User },
  { href: "/settings", view: "settings" as const, label: "Configuración", icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const viewCtx = useContext(ViewContext);

  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userCareer, setUserCareer] = useState<string | null>(null);
  const [userInitials, setUserInitials] = useState<string>("US");
  const [userLoading, setUserLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    // Prefetch proactivo de rutas del sidebar y usuario
    const routesToPrefetch = [
      "/home",
      "/bus",
      "/services",
      "/courses",
      "/profile",
      "/settings",
    ];
    routesToPrefetch.forEach((href) => {
      try {
        router.prefetch(href);
      } catch {
        // Silenciar errores de prefetch si alguna ruta aún no existe
      }
    });
  }, [router]);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user ?? null;
      if (user) {
        setIsAuth(true);
        const email = user.email ?? null;
        let fullName = (user.user_metadata?.full_name as string) || null;
        let career = (user.user_metadata?.career as string) || null;
        try {
          const { data: profile } = await supabase
            .from("users")
            .select("full_name, career, created_at")
            .eq("id", user.id)
            .single();
          if (profile) {
            fullName = profile.full_name ?? fullName;
            career = profile.career ?? career;
          }
        } catch {}
        const initials = fullName
          ? fullName
              .split(" ")
              .filter(Boolean)
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()
          : email
          ? email.slice(0, 2).toUpperCase()
          : "US";
        setUserEmail(email);
        setUserName(fullName);
        setUserCareer(career);
        setUserInitials(initials);
        try {
          localStorage.setItem(
            "sirius_user",
            JSON.stringify({ fullName, email, career, initials })
          );
          document.cookie = "sirius_auth=1; Path=/; Max-Age=2592000";
        } catch {}
      } else {
        setIsAuth(false);
        try {
          document.cookie = "sirius_auth=; Path=/; Max-Age=0";
        } catch {}
      }
      setUserLoading(false);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setIsAuth(!!user);
      if (user) {
        const email = user.email ?? null;
        const fullName = (user.user_metadata?.full_name as string) || null;
        const career = (user.user_metadata?.career as string) || null;
        const initials = fullName
          ? fullName
              .split(" ")
              .filter(Boolean)
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()
          : email
          ? email.slice(0, 2).toUpperCase()
          : "US";
        setUserEmail(email);
        setUserName(fullName);
        setUserCareer(career);
        setUserInitials(initials);
        try {
          localStorage.setItem(
            "sirius_user",
            JSON.stringify({ fullName, email, career, initials })
          );
        } catch {}
      } else {
        try {
          localStorage.removeItem("sirius_user");
        } catch {}
        try {
          document.cookie = "sirius_auth=; Path=/; Max-Age=0";
        } catch {}
        setUserEmail(null);
        setUserName(null);
        setUserCareer(null);
        setUserInitials("US");
        try {
          router.replace("/");
        } catch {}
      }
    });
    return () => {
      try {
        sub.subscription?.unsubscribe?.();
      } catch {}
    };
  }, [router]);

  useEffect(() => {
    if (!userLoading && !isAuth) {
      try {
        router.push("/");
      } catch {}
    }
  }, [userLoading, isAuth, router]);

  const handleNavClick = (
    href: string,
    view?: (typeof navItems)[number]["view"]
  ) => {
    if (viewCtx && view) {
      viewCtx.setActiveView(view);
    } else {
      router.push(href);
    }
  };

  const isItemActive = (
    href: string,
    view?: (typeof navItems)[number]["view"]
  ) => {
    return view
      ? viewCtx
        ? viewCtx.activeView === view
        : pathname === href
      : pathname === href;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    try {
      localStorage.removeItem("sirius_user");
    } catch {}
    try {
      document.cookie = "sirius_auth=; Path=/; Max-Age=0";
    } catch {}
    router.replace("/");
  };

  // Listen to cross-view event to open Post modal
  useEffect(() => {
    const listener = () => setIsPostModalOpen(true);
    const eventName = "sirius:openPostModal";
    window.addEventListener(eventName, listener as EventListener);
    return () => {
      try {
        window.removeEventListener(eventName, listener as EventListener);
      } catch {}
    };
  }, []);

  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      <PostModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} />
      <div className="mx-auto max-w-7xl px-4 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 h-screen flex-col sticky top-0 border-r border-border">
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center justify-start h-16 px-2">
              <Image
                src="/logo.png"
                alt="Logo unab"
                width={128}
                height={40}
                priority
                className="w-32 pt-10 h-auto"
              />
            </div>

            {/* Navigation */}
            <nav className="px-2 py-2 space-y-1 my-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.href, item.view);
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavClick(item.href, item.view)}
                    className={cn(
                      "flex items-center gap-4 px-2 py-3 rounded-full text-base transition-colors w-full text-left",
                      active
                        ? "text-[#ff9800] dark:text-primary font-bold"
                        : "text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* CTA Postear */}
            <div className="px-2 pb-4">
              <Button onClick={() => setIsPostModalOpen(true)} className="w-full rounded-full bg-[#ff9800] hover:bg-[#fb8c00] text-white py-6 text-base">
                Postear
              </Button>
            </div>

            {/* Theme Toggle */}
            <div className="px-2 py-4 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-full justify-start gap-3 px-2"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-5 h-5" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5" />
                    <span>Dark Mode</span>
                  </>
                )}
              </Button>
            </div>

            {/* User Menu */}
            <div className="px-2 py-4 border-t border-border">
              {userLoading ? (
                <div className="flex items-center gap-3 w-full px-2 py-3 rounded-full">
                  <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                  <div className="flex flex-col items-start gap-1">
                    <div className="w-24 h-3 bg-muted rounded animate-pulse" />
                    <div className="w-36 h-3 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ) : isAuth ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 w-full px-2 py-3 rounded-full hover:bg-accent transition-colors">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start min-w-0">
                        <span className="text-sm truncate max-w-[140px]">
                          {userName ?? "Usuario"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                          {userCareer ?? userEmail ?? "Estudiante"}
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">                    
                    <DropdownMenuItem
                      onClick={() => setIsPostModalOpen(true)}
                      className="cursor-pointer"
                    >
                      <Grid3x3 className="w-4 h-4 mr-2" />
                      Nueva publicación
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-3 w-full px-4 py-3 rounded-full">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>US</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm">Invitado</span>
                    <span className="text-xs text-muted-foreground">
                      Inicia sesión para continuar
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => router.push("/")}
                  >
                    Login
                  </Button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-0 pb-16 md:pb-0">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.href, item.view);
            return (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href, item.view)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                  active
                    ? "text-[#ff9800] dark:text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
