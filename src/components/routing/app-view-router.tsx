"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import HomeView from "@/domains/home/home-view"
import BusView from "@/domains/bus/bus-view"
import ServicesView from "@/domains/services/services-view"
import CoursesIndexView from "@/domains/courses/courses-index-view"
import ProfileView from "@/domains/profile/profile-view"
import SettingsView from "@/domains/settings/settings-view"
import { ViewContext, ViewName } from "@/components/context/view-context"

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