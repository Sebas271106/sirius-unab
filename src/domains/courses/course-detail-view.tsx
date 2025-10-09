"use client"

import { useState } from "react"
import Image from "next/image"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AssignmentSubmissionModal } from "@/components/modals/assignment-submission-modal"
import { QuizModal } from "@/components/modals/quiz-modal"
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageCircle,
  Pin,
  FileText,
  Video,
  Download,
  Calendar,
  AlertTriangle,
  Upload,
  Send,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

const courseData = {
  title: "Advanced Algorithms",
  code: "CS301",
  instructor: "Dr. Sarah Martinez",
  progress: 75,
  averageGrade: 88,
  image: "/computer-science-algorithms-code.jpg",
}

const assignments = [
  {
    id: 1,
    title: "Binary Search Trees Implementation",
    due: "2024-03-15",
    status: "completed",
    grade: 95,
    description: "Implement a balanced BST with insertion, deletion, and search operations",
    type: "assignment",
  },
  {
    id: 2,
    title: "Graph Algorithms Project",
    due: "2024-03-22",
    status: "pending",
    grade: null,
    description: "Implement Dijkstra's and A* pathfinding algorithms",
    type: "project",
  },
  {
    id: 3,
    title: "Dynamic Programming Exercises",
    due: "2024-03-29",
    status: "upcoming",
    grade: null,
    description: "Solve 5 DP problems from the textbook",
    type: "homework",
  },
  {
    id: 4,
    title: "Midterm Preparation Quiz",
    due: "2024-03-18",
    status: "upcoming",
    grade: null,
    description: "Practice quiz covering chapters 1-5",
    type: "quiz",
  },
]

const grades = [
  { name: "Midterm Exam", points: 85, total: 100, weight: 30 },
  { name: "Quiz 1", points: 18, total: 20, weight: 5 },
  { name: "Quiz 2", points: 19, total: 20, weight: 5 },
  { name: "Assignment 1", points: 95, total: 100, weight: 10 },
  { name: "Assignment 2", points: 88, total: 100, weight: 10 },
]

const discussions = [
  {
    id: 1,
    author: "Alex Johnson",
    avatar: "/placeholder.svg?height=32&width=32",
    time: "2h ago",
    content: "Can someone explain the time complexity of the merge sort algorithm?",
    replies: 3,
  },
  {
    id: 2,
    author: "Maria Garcia",
    avatar: "/placeholder.svg?height=32&width=32",
    time: "5h ago",
    content: "Great lecture today! The visualization of the A* algorithm was really helpful.",
    replies: 1,
  },
  {
    id: 3,
    author: "John Smith",
    avatar: "/placeholder.svg?height=32&width=32",
    time: "1d ago",
    content: "Does anyone have notes from last week's lecture? I had to miss it.",
    replies: 5,
  },
]

const announcements = [
  {
    id: 1,
    title: "Final Project Guidelines Posted",
    date: "Mar 10",
    pinned: true,
    content:
      "The final project guidelines are now available. Please review them carefully and form your teams by next week.",
  },
  {
    id: 2,
    title: "Office Hours This Week",
    date: "Mar 8",
    pinned: false,
    content: "Office hours will be held on Wednesday 2-4 PM and Friday 10-12 PM in room 305.",
  },
  {
    id: 3,
    title: "Midterm Results Available",
    date: "Mar 5",
    pinned: false,
    content: "Midterm exam results have been posted. Check the Grades section for your score.",
  },
]

const materials = [
  {
    id: 1,
    title: "Week 1: Introduction to Algorithms",
    type: "folder",
    items: [
      { name: "Lecture Slides.pdf", type: "pdf", size: "2.4 MB" },
      { name: "Lecture Recording", type: "video", duration: "1:45:00" },
      { name: "Reading: Chapter 1", type: "link" },
    ],
  },
  {
    id: 2,
    title: "Week 2: Sorting Algorithms",
    type: "folder",
    items: [
      { name: "Lecture Slides.pdf", type: "pdf", size: "3.1 MB" },
      { name: "Lecture Recording", type: "video", duration: "1:50:00" },
      { name: "Code Examples.zip", type: "file", size: "156 KB" },
    ],
  },
  {
    id: 3,
    title: "Week 3: Graph Algorithms",
    type: "folder",
    items: [
      { name: "Lecture Slides.pdf", type: "pdf", size: "2.8 MB" },
      { name: "Lecture Recording", type: "video", duration: "1:40:00" },
    ],
  },
]

const upcomingEvents = [
  { date: "2024-03-18", title: "Quiz 3", type: "quiz" },
  { date: "2024-03-22", title: "Project Due", type: "assignment" },
  { date: "2024-03-25", title: "Guest Lecture", type: "lecture" },
  { date: "2024-03-29", title: "Homework 4 Due", type: "homework" },
]

export default function CourseDetailPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  type AssignmentItem = { id: number; title: string; description: string; due: string }
  type QuizItem = { id: number; title: string; description: string; timeLimit: number }

  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentItem | null>(null)
  const [selectedQuiz, setSelectedQuiz] = useState<QuizItem | null>(null)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")

  const pendingTasks = assignments.filter((a) => a.status === "pending").length
  const upcomingTasks = assignments.filter((a) => a.status === "upcoming").length
  const completedTasks = assignments.filter((a) => a.status === "completed").length

  const handleOpenSubmission = (assignment: AssignmentItem) => {
    setSelectedAssignment(assignment)
  }

  const handleOpenQuiz = (assignment: AssignmentItem) => {
    setSelectedQuiz({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      timeLimit: 30,
    })
  }

  const handleSubmitReply = (discussionId: number) => {
    console.log("[v0] Submitting reply to discussion", discussionId, replyText)
    setReplyText("")
    setReplyingTo(null)
  }

  return (
          <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="relative h-48 bg-muted rounded-lg overflow-hidden mb-4">
            <Image
              src={courseData.image || "/placeholder.svg"}
              alt={courseData.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <h1 className="text-2xl text-foreground mb-2">{courseData.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="text-[#ff9800] font-medium">{courseData.code}</span>
                <span>·</span>
                <span>{courseData.instructor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Overall Progress</p>
                  <p className="text-3xl text-[#ff9800] font-medium mb-4">{courseData.progress}%</p>
                  <Progress value={courseData.progress} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Average Grade</p>
                  <p className="text-3xl text-[#ff9800] font-medium">{courseData.averageGrade}%</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Pending Tasks</p>
                  <p className="text-3xl text-foreground">{pendingTasks}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Completed</p>
                  <p className="text-3xl text-foreground">{completedTasks}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[#ff9800]" />
                  Upcoming Deadlines
                </h3>
                <div className="space-y-3">
                  {assignments
                    .filter((a) => a.status !== "completed")
                    .slice(0, 3)
                    .map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-[#ff9800]" />
                          <div>
                            <p className="text-sm text-foreground">{assignment.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Due:{" "}
                              {new Date(assignment.due).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {assignment.type}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium text-foreground mb-4">Course Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Welcome to Advanced Algorithms! This course will cover essential data structures and algorithmic
                  techniques including sorting, searching, graph algorithms, dynamic programming, and complexity
                  analysis. Make sure to complete all assignments on time and participate in class discussions.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="outline" className="text-sm">
                {pendingTasks} Pending
              </Badge>
              <Badge variant="outline" className="text-sm">
                {upcomingTasks} Upcoming
              </Badge>
              <Badge variant="outline" className="text-sm">
                {completedTasks} Completed
              </Badge>
            </div>

            <div className="space-y-4">
              {assignments.map((assignment) => {
                const dueDate = new Date(assignment.due)
                const today = new Date()
                const isOverdue = dueDate < today && assignment.status !== "completed"
                const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

                return (
                  <Card key={assignment.id} className={isOverdue ? "border-destructive" : ""}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          {assignment.status === "completed" && (
                            <CheckCircle2 className="w-5 h-5 text-[#ff9800] mt-0.5" />
                          )}
                          {assignment.status === "pending" && !isOverdue && (
                            <Clock className="w-5 h-5 text-[#ff9800] mt-0.5" />
                          )}
                          {isOverdue && <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />}
                          {assignment.status === "upcoming" && (
                            <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground mb-1">{assignment.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{assignment.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  Due:{" "}
                                  {dueDate.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    timeZone: "UTC",
                                  })}
                                </span>
                              </div>
                              {assignment.status !== "completed" && !isOverdue && daysUntilDue <= 7 && (
                                <span className="text-[#ff9800] font-medium">({daysUntilDue} days left)</span>
                              )}
                              {isOverdue && <span className="text-destructive">(Overdue)</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {assignment.grade && (
                            <span className="text-sm text-[#ff9800] font-medium">{assignment.grade}%</span>
                          )}
                          <Badge
                            variant={
                              assignment.status === "completed" ? "default" : isOverdue ? "destructive" : "secondary"
                            }
                            className="capitalize"
                          >
                            {isOverdue ? "overdue" : assignment.status}
                          </Badge>
                        </div>
                      </div>
                      {assignment.status !== "completed" && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                          {assignment.type === "quiz" ? (
                            <Button
                              size="sm"
                              onClick={() => handleOpenQuiz(assignment)}
                              className="bg-[#ff9800] hover:bg-[#ff9800]/90 text-white"
                            >
                              Start Quiz
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleOpenSubmission(assignment)}
                              className="bg-[#ff9800] hover:bg-[#ff9800]/90 text-white"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Submit Assignment
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      )}
                      {assignment.status === "completed" && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                          <Button size="sm" variant="outline">
                            View Submission
                          </Button>
                          <Button size="sm" variant="outline">
                            View Feedback
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            {materials.map((material) => (
              <Card key={material.id}>
                <CardContent className="p-6">
                  <h3 className="font-medium text-foreground mb-4">{material.title}</h3>
                  <div className="space-y-2">
                    {material.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          {item.type === "pdf" && <FileText className="w-5 h-5 text-[#ff9800]" />}
                          {item.type === "video" && <Video className="w-5 h-5 text-[#ff9800]" />}
                          {item.type === "file" && <Download className="w-5 h-5 text-[#ff9800]" />}
                          {item.type === "link" && <FileText className="w-5 h-5 text-[#ff9800]" />}
                          <div>
                            <p className="text-sm text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.size || item.duration || "External link"}
                            </p>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="grades" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-medium text-foreground">Grade Summary</h3>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Current Average</p>
                    <p className="text-2xl text-[#ff9800] font-medium">{courseData.averageGrade}%</p>
                  </div>
                </div>
                <Progress value={courseData.averageGrade} className="h-2" />
              </CardContent>
            </Card>

            <div className="space-y-4">
              {grades.map((grade, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="text-foreground">{grade.name}</span>
                        <p className="text-sm text-muted-foreground mt-1">Weight: {grade.weight}%</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-sm text-muted-foreground">
                          {grade.points} / {grade.total}
                        </span>
                        <span className="font-medium text-[#ff9800] text-lg">
                          {Math.round((grade.points / grade.total) * 100)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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

                <div className="grid grid-cols-7 gap-2 mb-6">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-sm text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}

                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 4 + 1
                    const isCurrentMonth = day > 0 && day <= 31
                    const hasEvent = isCurrentMonth && [18, 22, 25, 29].includes(day)

                    return (
                      <div
                        key={i}
                        className={`aspect-square flex items-center justify-center rounded-lg text-sm ${
                          isCurrentMonth
                            ? hasEvent
                              ? "bg-[#ff9800]/10 text-[#ff9800] font-medium"
                              : "text-foreground hover:bg-muted"
                            : "text-muted-foreground/30"
                        }`}
                      >
                        {isCurrentMonth ? day : ""}
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Upcoming Events</h3>
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-[#ff9800]" />
                        <div>
                          <p className="text-sm text-foreground">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" })}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {event.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discussions Tab */}
          <TabsContent value="discussions" className="space-y-4">
            <Button className="w-full bg-[#ff9800] hover:bg-[#ff9800]/90 text-white mb-4">
              <MessageCircle className="w-4 h-4 mr-2" />
              Start New Discussion
            </Button>

            {discussions.map((discussion) => (
              <Card key={discussion.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={discussion.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{discussion.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-foreground">{discussion.author}</span>
                        <span className="text-sm text-muted-foreground">·</span>
                        <span className="text-sm text-muted-foreground">{discussion.time}</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed mb-3">{discussion.content}</p>
                      <button
                        onClick={() => setReplyingTo(discussion.id)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#ff9800] transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{discussion.replies} replies</span>
                      </button>

                      {replyingTo === discussion.id && (
                        <div className="mt-4 space-y-3">
                          <Textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your reply..."
                            className="min-h-[100px]"
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSubmitReply(discussion.id)}
                              disabled={!replyText.trim()}
                              className="bg-[#ff9800] hover:bg-[#ff9800]/90 text-white"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Reply
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      {announcement.pinned && <Pin className="w-4 h-4 text-[#ff9800] mt-1" />}
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground mb-1">{announcement.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{announcement.date}</p>
                        <p className="text-sm text-foreground leading-relaxed">{announcement.content}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

      {selectedAssignment && (
        <AssignmentSubmissionModal
          isOpen={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          assignment={selectedAssignment}
        />
      )}

      {selectedQuiz && <QuizModal isOpen={!!selectedQuiz} onClose={() => setSelectedQuiz(null)} quiz={selectedQuiz} />}
    </div>
  )
}
