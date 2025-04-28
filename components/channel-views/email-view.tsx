"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Mail, Star, Trash, Reply, Forward, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface EmailViewProps {
  channelId: string
}

interface Email {
  id: string
  sender: string
  subject: string
  snippet: string
  timestamp: string
  read: boolean
  body: string
}

export default function EmailView({ channelId }: EmailViewProps) {
  // Mock data for emails
  const emails: Email[] = [
    {
      id: "1",
      sender: "John Doe",
      subject: "Project Update",
      snippet: "Here's the latest update on the project...",
      timestamp: "10:30 AM",
      read: true,
      body: "Hello,\n\nHere's the latest update on the project. We've completed the initial phase and are moving on to the next steps.\n\nPlease review the attached documents and let me know if you have any questions.\n\nBest regards,\nJohn",
    },
    {
      id: "2",
      sender: "Jane Smith",
      subject: "Meeting Tomorrow",
      snippet: "Reminder about our meeting tomorrow at 2 PM...",
      timestamp: "Yesterday",
      read: false,
      body: "Hi,\n\nThis is a reminder about our meeting tomorrow at 2 PM in the conference room. Please bring your presentation materials.\n\nThanks,\nJane",
    },
    {
      id: "3",
      sender: "Marketing Team",
      subject: "New Campaign Launch",
      snippet: "We're excited to announce our new marketing campaign...",
      timestamp: "Apr 15",
      read: true,
      body: "Hello Team,\n\nWe're excited to announce our new marketing campaign that will be launching next week. This campaign focuses on our new product line and targets our core demographic.\n\nPlease review the campaign materials and provide any feedback by Friday.\n\nBest,\nMarketing Team",
    },
  ]

  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [emailListWidth, setEmailListWidth] = useState("50%")
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle resize functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const containerWidth = containerRect.width
      const relativeX = e.clientX - containerRect.left

      // Calculate percentage width (min 30%, max 70%)
      const percentage = Math.min(Math.max((relativeX / containerWidth) * 100, 30), 70)
      setEmailListWidth(`${percentage}%`)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = "default"
      document.body.style.userSelect = "auto"
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "ew-resize"
      document.body.style.userSelect = "none"
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing])

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  return (
    <div ref={containerRef} className="flex h-full relative">
      {/* Email list */}
      <div className="border-r overflow-y-auto" style={{ width: emailListWidth }}>
        <div className="p-4 border-b">
          <Button className="w-full">
            <Mail className="mr-2 h-4 w-4" />
            Compose
          </Button>
        </div>
        <div>
          {emails.map((email) => (
            <div
              key={email.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                !email.read ? "font-semibold bg-gray-50" : ""
              } ${selectedEmail?.id === email.id ? "bg-gray-200" : ""}`}
              onClick={() => setSelectedEmail(email)}
            >
              <div className="flex justify-between">
                <div className="font-medium">{email.sender}</div>
                <div className="text-sm text-gray-500">{email.timestamp}</div>
              </div>
              <div className="text-sm font-medium">{email.subject}</div>
              <div className="text-sm text-gray-500 truncate">{email.snippet}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced resize handle */}
      <div
        className="resize-handle"
        style={{
          left: emailListWidth,
          height: "100%",
          width: "6px",
          position: "absolute",
          cursor: "ew-resize",
          backgroundColor: isResizing ? "#94a3b8" : "transparent",
          zIndex: 20,
        }}
        onMouseDown={startResizing}
      >
        <div className="flex h-full items-center justify-center">
          <div className="h-16 w-1 bg-gray-300 rounded-full opacity-60"></div>
        </div>
      </div>

      {/* Email content */}
      <div className="overflow-y-auto" style={{ width: `calc(100% - ${emailListWidth})` }}>
        {selectedEmail ? (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{selectedEmail.subject}</h2>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="font-medium">{selectedEmail.sender}</div>
                  <div className="text-sm text-gray-500">{selectedEmail.timestamp}</div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon">
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Reply className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Forward className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Separator />
            </div>
            <div className="whitespace-pre-line">{selectedEmail.body}</div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center">
                <textarea className="flex-1 p-2 border rounded-md mr-2" placeholder="Reply to this email..." rows={3} />
                <Button size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Select an email to view</div>
        )}
      </div>
    </div>
  )
}
