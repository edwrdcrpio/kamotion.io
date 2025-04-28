"use client"

import React from "react"
import { useState } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MenuIcon } from "lucide-react"
import AddLLMDialog from "@/components/dialogs/add-llm-dialog"
import AddInboxDialog from "@/components/dialogs/add-inbox-dialog"
import AddSocialDialog from "@/components/dialogs/add-social-dialog"
import AddWorkDialog from "@/components/dialogs/add-work-dialog"
import AddNoteDialog from "@/components/dialogs/add-note-dialog"

interface Conversation {
  id: string
  title: string
  messages: Array<{
    id: string
    sender: "user" | "bot"
    content: string
    timestamp: string
  }>
}

interface MenuProps {
  trigger?: React.ReactNode
  onAddLLM: (llm: {
    id: string
    name: string
    provider: string
    model: string
    apiKey: string
    customInstructions: string
    initialConversation: Conversation
  }) => void
  onAddInbox: (inbox: {
    id: string
    name: string
    provider: string
    email: string
    password: string
    serverSettings: {
      incomingServer: string
      outgoingServer: string
      incomingPort: number
      outgoingPort: number
    }
    syncFrequency: string
    notificationsEnabled: boolean
  }) => void
  onAddSocial: (social: {
    id: string
    name: string
    platform: string
    username: string
    accessToken?: string
    refreshToken?: string
    notificationsEnabled: boolean
    contentTypes: string[]
  }) => void
  onAddWork: (work: {
    id: string
    name: string
    type: string
    url: string
    apiKey?: string
    workspace?: string
    collection: string
    collectionColor: string
    notificationsEnabled: boolean
  }) => void
  onAddNote: (note: {
    id: string
    name: string
    category: string
    content: string
    tags: string[]
    pinned: boolean
  }) => void
}

export default function Menu({ trigger, onAddLLM, onAddInbox, onAddSocial, onAddWork, onAddNote }: MenuProps) {
  const [isAddLLMOpen, setIsAddLLMOpen] = useState(false)
  const [isAddInboxOpen, setIsAddInboxOpen] = useState(false)
  const [isAddSocialOpen, setIsAddSocialOpen] = useState(false)
  const [isAddWorkOpen, setIsAddWorkOpen] = useState(false)
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)

  const menuItems = [
    "Account",
    "Add Inbox",
    "Add Social",
    "Add LLM",
    "Add Work",
    "Add Note",
    "Settings",
    "Help",
    "Logout",
  ]

  const handleMenuItemClick = (item: string) => {
    switch (item) {
      case "Add LLM":
        setIsAddLLMOpen(true)
        break
      case "Add Inbox":
        setIsAddInboxOpen(true)
        break
      case "Add Social":
        setIsAddSocialOpen(true)
        break
      case "Add Work":
        setIsAddWorkOpen(true)
        break
      case "Add Note":
        setIsAddNoteOpen(true)
        break
      default:
        console.log(`Clicked on ${item}`)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="icon">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {menuItems.map((item, index) => (
            <React.Fragment key={item}>
              <DropdownMenuItem className="cursor-pointer" onClick={() => handleMenuItemClick(item)}>
                {item}
              </DropdownMenuItem>
              {index < menuItems.length - 1 && index === 5 && <DropdownMenuSeparator />}
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AddLLMDialog open={isAddLLMOpen} onOpenChange={setIsAddLLMOpen} onAddLLM={onAddLLM} />
      <AddInboxDialog open={isAddInboxOpen} onOpenChange={setIsAddInboxOpen} onAddInbox={onAddInbox} />
      <AddSocialDialog open={isAddSocialOpen} onOpenChange={setIsAddSocialOpen} onAddSocial={onAddSocial} />
      <AddWorkDialog open={isAddWorkOpen} onOpenChange={setIsAddWorkOpen} onAddWork={onAddWork} />
      <AddNoteDialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen} onAddNote={onAddNote} />
    </>
  )
}
