import Link from "next/link"
import Image from "next/image"
import { BookOpen, Clock, TrendingUp, Calendar, AlertTriangle } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const courses = [
  {
    id: 1,
    code: "CS301",
    title: "Advanced Algorithms",
    instructor: "Dr. Sarah Martinez",
    progress: 75,
    status: "Active",
    announcement: "Final project due next Friday",
    image: "/computer-science-algorithms-code.jpg",
    pendingTasks: 2,
    overdueTasks: 0,
  },
  {
    id: 2,
    code: "MATH205",
    title: "Linear Algebra",
    instructor: "Prof. James Wilson",
    progress: 60,
    status: "Active",
    announcement: "Midterm exam scheduled for next week",
    image: "/mathematics-linear-algebra-matrices.jpg",
    pendingTasks: 1,
    overdueTasks: 1,
  },
  {
    id: 3,
    code: "ENG102",
    title: "Technical Writing",
    instructor: "Dr. Emily Chen",
    progress: 85,
    status: "Active",
    announcement: "New reading assignment posted",
    image: "/writing-books-literature.jpg",
    pendingTasks: 3,
    overdueTasks: 0,
  },
  {
    id: 4,
    code: "PHY201",
    title: "Quantum Physics",
    instructor: "Dr. Michael Brown",
    progress: 45,
    status: "Active",
    announcement: "Lab report due this Friday",
    image: "/quantum-physics-atoms-particles.jpg",
    pendingTasks: 1,
    overdueTasks: 0,
  },
]

const upcomingDeadlines = [
  {
    id: 1,
    course: "Advanced Algorithms",
    task: "Graph Algorithms Project",
    date: "2024-03-22",
    type: "assignment",
    overdue: false,
  },
  { id: 2, course: "Linear Algebra", task: "Homework 5", date: "2024-03-20", type: "homework", overdue: true },
  { id: 3, course: "Technical Writing", task: "Essay Draft", date: "2024-03-25", type: "assignment", overdue: false },
  { id: 4, course: "Quantum Physics", task: "Lab Report 3", date: "2024-03-19", type: "lab", overdue: false },
  { id: 5, course: "Linear Algebra", task: "Midterm Exam", date: "2024-03-28", type: "exam", overdue: false },
]

export default function CoursesPage() {
  const totalPending = courses.reduce((sum, course) => sum + course.pendingTasks, 0)
  const totalOverdue = courses.reduce((sum, course) => sum + course.overdueTasks, 0)

  return (
          <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl text-foreground">My Courses</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4 text-[#ff9800]" />
            <span>Spring 2024</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Tasks</p>
                  <p className="text-2xl text-[#ff9800] font-medium">{totalPending}</p>
                </div>
                <Clock className="w-8 h-8 text-[#ff9800]/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Overdue</p>
                  <p className="text-2xl text-foreground">{totalOverdue}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-destructive/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Courses</p>
                  <p className="text-2xl text-foreground">{courses.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-[#ff9800]/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">All Courses</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="deadlines">Upcoming Deadlines</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`} prefetch>
                  <Card className="hover:shadow-lg hover:border-[#ff9800]/30 transition-all cursor-pointer h-full overflow-hidden">
                    <div className="relative h-40 bg-muted overflow-hidden">
                      <Image
                        src={course.image || "/placeholder.svg"}
                        alt={course.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={course.id === 1}
                        className="object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary">{course.status}</Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-foreground mb-1">{course.title}</h3>
                          <p className="text-sm text-[#ff9800]">{course.code}</p>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">{course.instructor}</p>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-[#ff9800]" />
                          <span className="text-muted-foreground">{course.pendingTasks} pending</span>
                        </div>
                        {course.overdueTasks > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                            <span className="text-destructive">{course.overdueTasks} overdue</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-[#ff9800] font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>

                      <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                        <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground leading-relaxed">{course.announcement}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Calendar className="w-5 h-5 text-[#ff9800]" />
                  <h2 className="text-lg text-foreground">March 2024</h2>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-sm text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}

                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 4 + 1
                    const isCurrentMonth = day > 0 && day <= 31
                    const hasDeadline = isCurrentMonth && [19, 20, 22, 25, 28].includes(day)
                    const isOverdue = isCurrentMonth && day === 20

                    return (
                      <div
                        key={i}
                        className={`aspect-square flex items-center justify-center rounded-lg text-sm ${
                          isCurrentMonth
                            ? hasDeadline
                              ? isOverdue
                                ? "bg-destructive/10 text-destructive font-medium"
                                : "bg-[#ff9800]/10 text-[#ff9800] font-medium"
                              : "text-foreground hover:bg-muted"
                            : "text-muted-foreground/30"
                        }`}
                      >
                        {isCurrentMonth ? day : ""}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6 flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#ff9800]/10" />
                    <span className="text-muted-foreground">Has deadline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-destructive/10" />
                    <span className="text-muted-foreground">Overdue</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deadlines" className="space-y-4">
            {upcomingDeadlines.map((deadline) => (
              <Card key={deadline.id} className={deadline.overdue ? "border-destructive" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {deadline.overdue ? (
                        <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                      ) : (
                        <Clock className="w-5 h-5 text-[#ff9800] mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground mb-1">{deadline.task}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{deadline.course}</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(deadline.date).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                              timeZone: "UTC",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={deadline.overdue ? "destructive" : "secondary"} className="capitalize">
                      {deadline.type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
  )
}
