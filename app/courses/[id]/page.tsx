"use client"

import CourseDetailView from "@/domains/courses/course-detail-view"
import { AppLayout } from "@/components/layout/app-layout"

export default function Page() {
  return (
    <AppLayout>
      <CourseDetailView />
    </AppLayout>
  )
}