"use client"

import { MenuIcon } from "lucide-react"
import Logo from "@/components/logo"
import Menu from "@/components/menu"

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

interface HeaderProps {
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

export default function Header({ onAddLLM, onAddInbox, onAddSocial, onAddWork, onAddNote }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center">
        <Logo />
      </div>
      <div className="flex items-center">
        <div className="mr-4 text-sm text-gray-500">71° San Diego, CA</div>
        <Menu
          onAddLLM={onAddLLM}
          onAddInbox={onAddInbox}
          onAddSocial={onAddSocial}
          onAddWork={onAddWork}
          onAddNote={onAddNote}
          trigger={
            <button className="p-1 rounded-md hover:bg-gray-100">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </button>
          }
        />
      </div>
    </header>
  )
}
