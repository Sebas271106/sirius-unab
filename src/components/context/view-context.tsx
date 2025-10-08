"use client"

import { createContext } from "react"

export type ViewName = "home" | "bus" | "services" | "courses" | "profile" | "settings"

export interface ViewContextValue {
  activeView: ViewName
  setActiveView: (view: ViewName) => void
}

export const ViewContext = createContext<ViewContextValue | null>(null)