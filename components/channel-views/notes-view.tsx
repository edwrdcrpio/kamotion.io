"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Save, Trash, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface NotesViewProps {
  channelId: string
}

interface Note {
  id: string
  title: string
  content: string
  updatedAt: string
}

export default function NotesView({ channelId }: NotesViewProps) {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Meeting Notes",
      content: "- Discussed project timeline\n- Assigned tasks to team members\n- Set next meeting for Friday",
      updatedAt: "Apr 18, 2025",
    },
    {
      id: "2",
      title: "Ideas for New Project",
      content: "1. Implement user authentication\n2. Create dashboard\n3. Add analytics features",
      updatedAt: "Apr 15, 2025",
    },
    {
      id: "3",
      title: "Shopping List",
      content: "- Milk\n- Eggs\n- Bread\n- Apples",
      updatedAt: "Apr 10, 2025",
    },
  ])

  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [editedTitle, setEditedTitle] = useState("")
  const [editedContent, setEditedContent] = useState("")

  // State for resizable notes list
  const [notesListWidth, setNotesListWidth] = useState("33%")
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)
    setEditedTitle(note.title)
    setEditedContent(note.content)
  }

  const handleSaveNote = () => {
    if (!selectedNote) return

    const updatedNotes = notes.map((note) =>
      note.id === selectedNote.id
        ? {
            ...note,
            title: editedTitle,
            content: editedContent,
            updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          }
        : note,
    )

    setNotes(updatedNotes)
    setSelectedNote({
      ...selectedNote,
      title: editedTitle,
      content: editedContent,
      updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    })
  }

  const handleDeleteNote = () => {
    if (!selectedNote) return

    const updatedNotes = notes.filter((note) => note.id !== selectedNote.id)
    setNotes(updatedNotes)
    setSelectedNote(null)
    setEditedTitle("")
    setEditedContent("")
  }

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
      updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    }

    setNotes([newNote, ...notes])
    handleSelectNote(newNote)
  }

  // Handle resize functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const containerWidth = containerRect.width
      const relativeX = e.clientX - containerRect.left

      // Calculate percentage width (min 20%, max 60%)
      const percentage = Math.min(Math.max((relativeX / containerWidth) * 100, 20), 60)
      setNotesListWidth(`${percentage}%`)
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
      {/* Notes list */}
      <div className="border-r overflow-y-auto" style={{ width: notesListWidth }}>
        <div className="p-4 border-b">
          <Button className="w-full" onClick={handleCreateNote}>
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Button>
        </div>
        <div>
          {notes.map((note) => (
            <div
              key={note.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                selectedNote?.id === note.id ? "bg-gray-200" : ""
              }`}
              onClick={() => handleSelectNote(note)}
            >
              <div className="font-medium">{note.title}</div>
              <div className="text-sm text-gray-500 truncate">{note.content}</div>
              <div className="text-xs text-gray-400 mt-1">{note.updatedAt}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced resize handle */}
      <div
        className="resize-handle"
        style={{
          left: notesListWidth,
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

      {/* Note editor */}
      <div className="overflow-y-auto" style={{ width: `calc(100% - ${notesListWidth})` }}>
        {selectedNote ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-xl font-bold"
              />
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleSaveNote}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeleteNote}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-[calc(100vh-200px)] p-4 border rounded-md"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a note to edit or create a new one
          </div>
        )}
      </div>
    </div>
  )
}
