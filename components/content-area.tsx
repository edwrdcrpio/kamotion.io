import EmailView from "@/components/channel-views/email-view"
import ChatView from "@/components/channel-views/chat-view"
import NotesView from "@/components/channel-views/notes-view"
import SocialView from "@/components/channel-views/social-view"

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

interface ContentAreaProps {
  selectedChannel: string | null
  customLLMs?: CustomLLM[]
  onAddMessage?: (llmId: string, conversationId: string, message: { sender: "user" | "bot"; content: string }) => void
  onAddConversation?: (llmId: string) => string | undefined
}

export default function ContentArea({
  selectedChannel,
  customLLMs = [],
  onAddMessage,
  onAddConversation,
}: ContentAreaProps) {
  // Find the selected custom LLM if applicable
  const selectedLLM = customLLMs.find((llm) => llm.id === selectedChannel)

  // Determine which view to render based on the selected channel
  const renderChannelView = () => {
    if (!selectedChannel) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">Select a channel to view content</div>
      )
    }

    if (
      selectedChannel.includes("inbox") ||
      selectedChannel === "outlook" ||
      selectedChannel === "gmail" ||
      selectedChannel === "apple"
    ) {
      return <EmailView channelId={selectedChannel} />
    }

    if (selectedChannel === "chatgpt" || selectedChannel === "grok") {
      // Built-in LLMs use the default ChatView
      return <ChatView channelId={selectedChannel} />
    }

    if (selectedChannel.startsWith("llm-") && selectedLLM) {
      // Custom LLMs use the ChatView with their specific data
      return (
        <ChatView
          channelId={selectedChannel}
          customLLM={selectedLLM}
          onAddMessage={onAddMessage}
          onAddConversation={onAddConversation}
        />
      )
    }

    if (selectedChannel.includes("notes")) {
      return <NotesView channelId={selectedChannel} />
    }

    // Default to social view for other channels
    return <SocialView channelId={selectedChannel} />
  }

  return <div className="flex-1 bg-white overflow-y-auto">{renderChannelView()}</div>
}
