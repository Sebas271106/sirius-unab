"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { ViewContext, ViewName } from "@/components/context/view-context"

const AppLayout = dynamic(() => import("@/components/layout/app-layout").then(m => m.AppLayout), { ssr: false })
const HomeView = dynamic(() => import("@/domains/home/home-view"), { ssr: false })
const BusView = dynamic(() => import("@/domains/bus/bus-view"), { ssr: false })
const ServicesView = dynamic(() => import("@/domains/services/services-view"), { ssr: false })
const CoursesIndexView = dynamic(() => import("@/domains/courses/courses-index-view"), { ssr: false })
const ProfileView = dynamic(() => import("@/domains/profile/profile-view"), { ssr: false })
const SettingsView = dynamic(() => import("@/domains/settings/settings-view"), { ssr: false })

export function AppViewRouter({ initialView = "home" as ViewName }: { initialView?: ViewName }) {
  const [activeView, setActiveView] = useState<ViewName>(initialView)

  return (
    <ViewContext.Provider value={{ activeView, setActiveView }}>
      <AppLayout>
        {activeView === "home" && <HomeView />}
        {activeView === "bus" && <BusView />}
        {activeView === "services" && <ServicesView />}
        {activeView === "courses" && <CoursesIndexView />}
        {activeView === "profile" && <ProfileView />}
        {activeView === "settings" && <SettingsView />}
      </AppLayout>
    </ViewContext.Provider>
  )
}