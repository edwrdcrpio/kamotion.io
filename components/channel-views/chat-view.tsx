"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Plus, User, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

interface ChatViewProps {
  channelId: string
  customLLM?: CustomLLM
  onAddMessage?: (llmId: string, conversationId: string, message: { sender: "user" | "bot"; content: string }) => void
  onAddConversation?: (llmId: string) => string | undefined
}

export default function ChatView({ channelId, customLLM, onAddMessage, onAddConversation }: ChatViewProps) {
  // Get LLM display name from channelId or customLLM
  const getLLMDisplayName = () => {
    if (customLLM) {
      // Extract name from customLLM, removing the # prefix if present
      return customLLM.name.startsWith("#") ? customLLM.name.substring(1) : customLLM.name
    }

    if (channelId === "chatgpt") return "ChatGPT"
    if (channelId === "grok") return "Grok"

    // For custom LLMs without data, extract the provider and create a display name
    if (channelId.startsWith("llm-")) {
      const parts = channelId.split("-")
      if (parts.length >= 2) {
        const provider = parts[1]
        return provider.charAt(0).toUpperCase() + provider.slice(1) // Capitalize provider name
      }
    }

    return "AI Assistant" // Fallback name
  }

  // Default mock conversations for built-in LLMs
  const defaultConversations: Conversation[] = [
    {
      id: "1",
      title: "Coding Help",
      messages: [
        {
          id: "1",
          sender: "bot",
          content: `Hello! I'm ${getLLMDisplayName()}. How can I assist you today?`,
          timestamp: "10:30 AM",
        },
        {
          id: "2",
          sender: "user",
          content: "I need help with a coding problem.",
          timestamp: "10:31 AM",
        },
        {
          id: "3",
          sender: "bot",
          content: "Sure, I'd be happy to help. Could you please describe the problem you're facing?",
          timestamp: "10:31 AM",
        },
      ],
    },
    {
      id: "2",
      title: "Project Ideas",
      messages: [
        {
          id: "1",
          sender: "user",
          content: "I'm thinking about starting a new project using React and TypeScript.",
          timestamp: "Yesterday",
        },
        {
          id: "2",
          sender: "bot",
          content: "That sounds like an interesting project! What kind of application are you planning to build?",
          timestamp: "Yesterday",
        },
      ],
    },
  ]

  // Use custom LLM conversations if available, otherwise use default
  const initialConversations = customLLM ? customLLM.conversations : defaultConversations

  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    conversations.length > 0 ? conversations[0] : null,
  )
  const [newMessage, setNewMessage] = useState("")
  const [conversationListWidth, setConversationListWidth] = useState("30%")
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Update conversations when customLLM changes
  useEffect(() => {
    if (customLLM) {
      setConversations(customLLM.conversations)
      setSelectedConversation(customLLM.conversations.length > 0 ? customLLM.conversations[0] : null)
    }
  }, [customLLM])

  // Scroll to bottom of messages when a new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedConversation?.messages])

  // Handle resize functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const containerWidth = containerRect.width
      const relativeX = e.clientX - containerRect.left

      // Calculate percentage width (min 20%, max 50%)
      const percentage = Math.min(Math.max((relativeX / containerWidth) * 100, 20), 50)
      setConversationListWidth(`${percentage}%`)
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

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    // For custom LLMs, use the provided onAddMessage function
    if (customLLM && onAddMessage && selectedConversation) {
      // Add user message
      onAddMessage(customLLM.id, selectedConversation.id, {
        sender: "user",
        content: newMessage,
      })

      // Simulate bot response
      setTimeout(() => {
        onAddMessage(customLLM.id, selectedConversation.id, {
          sender: "bot",
          content: `I'm ${getLLMDisplayName()}, and I'm processing your request about "${newMessage.substring(0, 20)}${
            newMessage.length > 20 ? "..." : ""
          }"`,
        })
      }, 1000)

      setNewMessage("")
      return
    }

    // For built-in LLMs, use the local state
    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, userMessage],
    }

    const updatedConversations = conversations.map((conv) =>
      conv.id === selectedConversation.id ? updatedConversation : conv,
    )

    setConversations(updatedConversations)
    setSelectedConversation(updatedConversation)
    setNewMessage("")

    // Simulate bot response for built-in LLMs
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        content: `I'm ${getLLMDisplayName()}, and I'm processing your request about "${newMessage.substring(0, 20)}${
          newMessage.length > 20 ? "..." : ""
        }"`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      const updatedWithBotMessage = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, botMessage],
      }

      const finalUpdatedConversations = updatedConversations.map((conv) =>
        conv.id === selectedConversation.id ? updatedWithBotMessage : conv,
      )

      setConversations(finalUpdatedConversations)
      setSelectedConversation(updatedWithBotMessage)
    }, 1000)
  }

  const createNewConversation = () => {
    // For custom LLMs, use the provided onAddConversation function
    if (customLLM && onAddConversation) {
      const newConversationId = onAddConversation(customLLM.id)
      if (newConversationId && customLLM.conversations.length > 0) {
        // Find the newly created conversation
        const newConv = customLLM.conversations.find((conv) => conv.id === newConversationId)
        if (newConv) {
          setSelectedConversation(newConv)
        }
      }
      setNewMessage("")
      return
    }

    // For built-in LLMs, use the local state
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: `New Chat ${conversations.length + 1}`,
      messages: [
        {
          id: "1",
          sender: "bot",
          content: `Hello! I'm ${getLLMDisplayName()}. How can I help you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    }

    setConversations([newConv, ...conversations])
    setSelectedConversation(newConv)
    setNewMessage("")
  }

  return (
    <div ref={containerRef} className="flex h-full relative">
      {/* Conversation list */}
      <div className="border-r overflow-y-auto" style={{ width: conversationListWidth }}>
        <div className="p-4 border-b">
          <Button className="w-full" onClick={createNewConversation}>
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
        <div>
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                selectedConversation?.id === conversation.id ? "bg-gray-200" : ""
              }`}
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className="flex justify-between">
                <div className="font-medium">{conversation.title}</div>
                <div className="text-sm text-gray-500">
                  {conversation.messages.length > 0
                    ? conversation.messages[conversation.messages.length - 1].timestamp
                    : ""}
                </div>
              </div>
              <div className="text-sm text-gray-500 truncate">
                {conversation.messages.length > 0
                  ? conversation.messages[conversation.messages.length - 1].content
                  : "No messages yet"}
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="p-4 text-center text-gray-500">No conversations yet. Start a new chat!</div>
          )}
        </div>
      </div>

      {/* Enhanced resize handle */}
      <div
        className="resize-handle"
        style={{
          left: conversationListWidth,
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

      {/* Chat content */}
      <div className="flex flex-col overflow-hidden" style={{ width: `calc(100% - ${conversationListWidth})` }}>
        {selectedConversation ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">{selectedConversation.title}</h2>
              <div className="text-sm text-gray-500">
                {getLLMDisplayName()} • {selectedConversation.messages.length} messages
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex max-w-[80%]">
                    <div className={`p-1 flex items-start ${message.sender === "user" ? "order-last ml-2" : "mr-2"}`}>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {message.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                    </div>
                    <div>
                      <div
                        className={`p-3 rounded-lg ${
                          message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {message.content}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{message.timestamp}</div>
                    </div>
                  </div>
                </div>
              ))}
              {selectedConversation.messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No messages yet. Start a conversation!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat input */}
            <div className="p-4 border-t">
              <div className="flex">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 mr-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            {conversations.length > 0
              ? "Select a conversation or create a new one"
              : "Create a new conversation to get started"}
          </div>
        )}
      </div>
    </div>
  )
}
