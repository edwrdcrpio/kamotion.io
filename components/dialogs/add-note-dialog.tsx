"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface AddNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddNote: (note: {
    id: string
    name: string
    category: string
    content: string
    tags: string[]
    pinned: boolean
  }) => void
}

export default function AddNoteDialog({ open, onOpenChange, onAddNote }: AddNoteDialogProps) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("personal")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [pinned, setPinned] = useState(false)

  const handleAdd = () => {
    if (!title) return

    // Generate a unique ID for the new note
    const id = `notes-${category}-${Date.now()}`

    // Create a display name for the channel list
    let displayName = `Notes-${title}`
    if (!displayName.startsWith("#")) {
      displayName = `#${displayName}`
    }

    // Process tags
    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    // Add the note to the channel list
    onAddNote({
      id,
      name: displayName,
      category,
      content,
      tags: tagArray,
      pinned,
    })

    // Reset form and close dialog
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setTitle("")
    setCategory("personal")
    setContent("")
    setTags("")
    setPinned(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>Create a new note in your dashboard.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="note-title" className="text-right">
              Title
            </Label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Note title"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="note-category" className="text-right">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="note-category" className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="ideas">Ideas</SelectItem>
                <SelectItem value="tasks">Tasks</SelectItem>
                <SelectItem value="journal">Journal</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="note-content" className="text-right pt-2">
              Content
            </Label>
            <Textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="col-span-3 min-h-[100px]"
              placeholder="Note content..."
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="note-tags" className="text-right">
              Tags
            </Label>
            <Input
              id="note-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="col-span-3"
              placeholder="Comma-separated tags"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right">
              <Label htmlFor="pinned">Pin Note</Label>
            </div>
            <div className="flex items-center space-x-2 col-span-3">
              <input
                type="checkbox"
                id="pinned"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="pinned"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Pin this note to the top
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleAdd} disabled={!title}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
