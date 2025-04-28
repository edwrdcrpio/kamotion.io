"use client"

import { useState } from "react"
import Header from "@/components/header"
import LeftSidebar from "@/components/left-sidebar"
import ContentArea from "@/components/content-area"
import { useMediaQuery } from "@/hooks/use-media-query"

// Define types for our LLM and conversation data
interface Message {
  id: string
  sender: "user" | "bot"
  content: string
  timestamp: string
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
}

interface CustomLLM {
  id: string
  name: string
  provider: string
  model: string
  apiKey: string
  customInstructions: string
  conversations: Conversation[]
}

interface Inbox {
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
}

interface Social {
  id: string
  name: string
  platform: string
  username: string
  accessToken?: string
  refreshToken?: string
  notificationsEnabled: boolean
  contentTypes: string[]
}

interface Work {
  id: string
  name: string
  type: string
  url: string
  apiKey?: string
  workspace?: string
  collection: string
  collectionColor: string
  notificationsEnabled: boolean
}

interface Note {
  id: string
  name: string
  category: string
  content: string
  tags: string[]
  pinned: boolean
}

export default function Dashboard() {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [customLLMs, setCustomLLMs] = useState<CustomLLM[]>([])
  const [inboxes, setInboxes] = useState<Inbox[]>([])
  const [socials, setSocials] = useState<Social[]>([])
  const [works, setWorks] = useState<Work[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const isMobile = useMediaQuery("(max-width: 768px)")

  const handleAddLLM = (llm: {
    id: string
    name: string
    provider: string
    model: string
    apiKey: string
    customInstructions: string
    initialConversation: Conversation
  }) => {
    const newLLM: CustomLLM = {
      id: llm.id,
      name: llm.name,
      provider: llm.provider,
      model: llm.model,
      apiKey: llm.apiKey,
      customInstructions: llm.customInstructions,
      conversations: [llm.initialConversation],
    }

    setCustomLLMs((prev) => [...prev, newLLM])

    // Automatically select the new LLM
    setSelectedChannel(llm.id)
  }

  const handleAddInbox = (inbox: {
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
  }) => {
    setInboxes((prev) => [...prev, inbox])
    setSelectedChannel(inbox.id)
  }

  const handleAddSocial = (social: {
    id: string
    name: string
    platform: string
    username: string
    accessToken?: string
    refreshToken?: string
    notificationsEnabled: boolean
    contentTypes: string[]
  }) => {
    setSocials((prev) => [...prev, social])
    setSelectedChannel(social.id)
  }

  const handleAddWork = (work: {
    id: string
    name: string
    type: string
    url: string
    apiKey?: string
    workspace?: string
    collection: string
    collectionColor: string
    notificationsEnabled: boolean
  }) => {
    setWorks((prev) => [...prev, work])
    setSelectedChannel(work.id)
  }

  const handleAddNote = (note: {
    id: string
    name: string
    category: string
    content: string
    tags: string[]
    pinned: boolean
  }) => {
    setNotes((prev) => [...prev, note])
    setSelectedChannel(note.id)
  }

  // Function to add a message to a conversation
  const handleAddMessage = (
    llmId: string,
    conversationId: string,
    message: { sender: "user" | "bot"; content: string },
  ) => {
    setCustomLLMs((prevLLMs) =>
      prevLLMs.map((llm) => {
        if (llm.id === llmId) {
          const updatedConversations = llm.conversations.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: [
                  ...conv.messages,
                  {
                    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    sender: message.sender,
                    content: message.content,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  },
                ],
              }
            }
            return conv
          })

          return {
            ...llm,
            conversations: updatedConversations,
          }
        }
        return llm
      }),
    )
  }

  // Function to add a new conversation to an LLM
  const handleAddConversation = (llmId: string) => {
    const llm = customLLMs.find((l) => l.id === llmId)
    if (!llm) return

    const newConversation: Conversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: `New Conversation`,
      messages: [
        {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          sender: "bot",
          content: `Hello! I'm your ${llm.model} assistant. How can I help you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    }

    setCustomLLMs((prevLLMs) =>
      prevLLMs.map((l) => {
        if (l.id === llmId) {
          return {
            ...l,
            conversations: [newConversation, ...l.conversations],
          }
        }
        return l
      }),
    )

    return newConversation.id
  }

  return (
    <div className="flex flex-col h-screen">
      <Header
        onAddLLM={handleAddLLM}
        onAddInbox={handleAddInbox}
        onAddSocial={handleAddSocial}
        onAddWork={handleAddWork}
        onAddNote={handleAddNote}
      />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar
          selectedChannel={selectedChannel}
          setSelectedChannel={setSelectedChannel}
          isMobile={isMobile}
          customLLMs={customLLMs}
          inboxes={inboxes}
          socials={socials}
          works={works}
          notes={notes}
        />
        <ContentArea
          selectedChannel={selectedChannel}
          customLLMs={customLLMs}
          inboxes={inboxes}
          socials={socials}
          works={works}
          notes={notes}
          onAddMessage={handleAddMessage}
          onAddConversation={handleAddConversation}
        />
      </div>
    </div>
  )
}
