"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ChannelList from "@/components/channel-list"
import CreateChannelDialog from "@/components/create-channel-dialog"
import { cn } from "@/lib/utils"

interface CustomLLM {
  id: string
  name: string
  provider: string
}

interface Inbox {
  id: string
  name: string
  provider: string
}

interface Social {
  id: string
  name: string
  platform: string
}

interface Work {
  id: string
  name: string
  type: string
  collection: string
  collectionColor: string
}

interface Note {
  id: string
  name: string
  category: string
}

interface LeftSidebarProps {
  selectedChannel: string | null
  setSelectedChannel: (channel: string) => void
  isMobile: boolean
  customLLMs?: CustomLLM[]
  inboxes?: Inbox[]
  socials?: Social[]
  works?: Work[]
  notes?: Note[]
}

export default function LeftSidebar({
  selectedChannel,
  setSelectedChannel,
  isMobile,
  customLLMs = [],
  inboxes = [],
  socials = [],
  works = [],
  notes = [],
}: LeftSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarWidth, setSidebarWidth] = useState(isMobile ? "100%" : "35%")
  const [isResizing, setIsResizing] = useState(false)
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const resizeHandleRef = useRef<HTMLDivElement>(null)

  // Handle resize functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || isMobile) return

      const newWidth = e.clientX
      const windowWidth = window.innerWidth

      // Set min and max width constraints (20% to 50% of window width)
      const minWidth = windowWidth * 0.2
      const maxWidth = windowWidth * 0.5

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(`${newWidth}px`)
      }
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
  }, [isResizing, isMobile])

  const startResizing = () => {
    if (!isMobile) {
      setIsResizing(true)
    }
  }

  // Get collections from works
  const collections = Array.from(new Set(works.map((work) => work.collection)))

  const handleCreateChannel = (name: string, collection?: string) => {
    console.log(`Creating new channel: ${name}, collection: ${collection || "none"}`)
    // In a real app, you'd add the channel to your state
    // For now, we'll just select it (assuming it exists)
    setSelectedChannel(name.toLowerCase().replace(/\s+/g, "-"))
  }

  return (
    <>
      <div
        ref={sidebarRef}
        className={cn(
          "bg-[#F5F5F5] flex flex-col border-r relative",
          "left-scrollbar", // Custom class for left scrollbar
        )}
        style={{
          width: sidebarWidth,
          direction: "rtl", // This flips the scrollbar to the left
        }}
      >
        <div style={{ direction: "ltr" }}>
          {" "}
          {/* Flip content back to normal */}
          <div className="p-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search channels..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button size="icon" variant="outline" onClick={() => setIsCreateChannelOpen(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ChannelList
              searchQuery={searchQuery}
              selectedChannel={selectedChannel}
              setSelectedChannel={setSelectedChannel}
              customLLMs={customLLMs}
              inboxes={inboxes}
              socials={socials}
              works={works}
              notes={notes}
            />
          </div>
        </div>
      </div>

      {/* Resize handle */}
      {!isMobile && (
        <div
          ref={resizeHandleRef}
          className="w-1 bg-transparent hover:bg-gray-300 cursor-ew-resize z-10"
          onMouseDown={startResizing}
        />
      )}

      {/* Create Channel Dialog */}
      <CreateChannelDialog
        open={isCreateChannelOpen}
        onOpenChange={setIsCreateChannelOpen}
        collections={collections}
        onCreateChannel={handleCreateChannel}
      />
    </>
  )
}
