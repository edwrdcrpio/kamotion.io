"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import ChannelContextMenu from "@/components/channel-context-menu"
import CollectionContextMenu from "@/components/collection-context-menu"
import DraggableChannelItem from "@/components/draggable-channel-item"

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

interface ChannelListProps {
  searchQuery: string
  selectedChannel: string | null
  setSelectedChannel: (channel: string) => void
  customLLMs?: CustomLLM[]
  inboxes?: Inbox[]
  socials?: Social[]
  works?: Work[]
  notes?: Note[]
}

interface Channel {
  id: string
  name: string
  hasUnread: boolean
  collection?: string
  collectionColor?: string
  highlightColor?: string
  position?: number
}

export default function ChannelList({
  searchQuery,
  selectedChannel,
  setSelectedChannel,
  customLLMs = [],
  inboxes = [],
  socials = [],
  works = [],
  notes = [],
}: ChannelListProps) {
  // Base channels
  const [channels, setChannels] = useState<Channel[]>([
    { id: "outlook", name: "Inbox: Outlook", hasUnread: false, position: 0 },
    { id: "gmail", name: "Inbox: Gmail", hasUnread: true, position: 1 },
    { id: "apple", name: "Inbox: Apple", hasUnread: false, position: 2 },
    { id: "instagram", name: "#Instagram", hasUnread: false, position: 3 },
    { id: "facebook", name: "#Facebook", hasUnread: false, position: 4 },
    { id: "youtube", name: "#YouTube", hasUnread: true, position: 5 },
    { id: "chatgpt", name: "#ChatGPT", hasUnread: false, position: 6 },
    { id: "grok", name: "#Grok", hasUnread: false, position: 7 },
    { id: "notes-personal", name: "#Notes-Personal", hasUnread: false, position: 8 },
    {
      id: "job1-inbox",
      name: "Inbox: Job 1",
      hasUnread: false,
      collection: "Job 1",
      collectionColor: "#ADD8E6",
      position: 9,
    },
    {
      id: "job1-slack",
      name: "#Slack",
      hasUnread: false,
      collection: "Job 1",
      collectionColor: "#ADD8E6",
      position: 10,
    },
    {
      id: "job2-inbox",
      name: "Inbox: Job 2",
      hasUnread: true,
      collection: "Job 2",
      collectionColor: "#DDA0DD",
      position: 11,
    },
    {
      id: "job2-slack",
      name: "#Slack",
      hasUnread: true,
      collection: "Job 2",
      collectionColor: "#DDA0DD",
      position: 12,
    },
    {
      id: "job2-zendesk",
      name: "#Zendesk",
      hasUnread: false,
      collection: "Job 2",
      collectionColor: "#DDA0DD",
      position: 13,
    },
    {
      id: "job2-airtable",
      name: "#Airtable",
      hasUnread: false,
      collection: "Job 2",
      collectionColor: "#DDA0DD",
      position: 14,
    },
  ])

  // Add custom channels from props
  useEffect(() => {
    const newChannels: Channel[] = []

    // Add LLMs
    customLLMs.forEach((llm) => {
      if (!channels.some((c) => c.id === llm.id)) {
        newChannels.push({
          id: llm.id,
          name: llm.name,
          hasUnread: false,
          position: channels.length + newChannels.length,
        })
      }
    })

    // Add Inboxes
    inboxes.forEach((inbox) => {
      if (!channels.some((c) => c.id === inbox.id)) {
        newChannels.push({
          id: inbox.id,
          name: inbox.name,
          hasUnread: false,
          position: channels.length + newChannels.length,
        })
      }
    })

    // Add Socials
    socials.forEach((social) => {
      if (!channels.some((c) => c.id === social.id)) {
        newChannels.push({
          id: social.id,
          name: social.name,
          hasUnread: false,
          position: channels.length + newChannels.length,
        })
      }
    })

    // Add Works with their collections
    works.forEach((work) => {
      if (!channels.some((c) => c.id === work.id)) {
        newChannels.push({
          id: work.id,
          name: work.name,
          hasUnread: false,
          collection: work.collection,
          collectionColor: work.collectionColor,
          position: channels.length + newChannels.length,
        })
      }
    })

    // Add Notes
    notes.forEach((note) => {
      if (!channels.some((c) => c.id === note.id)) {
        newChannels.push({
          id: note.id,
          name: note.name,
          hasUnread: false,
          position: channels.length + newChannels.length,
        })
      }
    })

    if (newChannels.length > 0) {
      setChannels((prev) => [...prev, ...newChannels])
    }
  }, [customLLMs, inboxes, socials, works, notes])

  const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({
    "Job 1": true,
    "Job 2": true,
  })

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    channelId: string
  }>({
    visible: false,
    x: 0,
    y: 0,
    channelId: "",
  })

  const [collectionContextMenu, setCollectionContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    collection: string
    collectionColor: string
  }>({
    visible: false,
    x: 0,
    y: 0,
    collection: "",
    collectionColor: "",
  })

  // Drag and drop state
  const [draggedChannel, setDraggedChannel] = useState<{
    id: string
    collection?: string
  } | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Get all unique collections
  const collections = Array.from(new Set(channels.filter((c) => c.collection).map((c) => c.collection!)))

  const toggleCollection = (collection: string) => {
    setExpandedCollections({
      ...expandedCollections,
      [collection]: !expandedCollections[collection],
    })
  }

  // Filter channels based on search query
  const filteredChannels = channels.filter((channel) => channel.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Group channels by collection
  const groupedChannels: Record<string, Channel[]> = {}
  const uncategorizedChannels: Channel[] = []

  filteredChannels.forEach((channel) => {
    if (channel.collection) {
      if (!groupedChannels[channel.collection]) {
        groupedChannels[channel.collection] = []
      }
      groupedChannels[channel.collection].push(channel)
    } else {
      uncategorizedChannels.push(channel)
    }
  })

  // Sort channels by position
  uncategorizedChannels.sort((a, b) => (a.position || 0) - (b.position || 0))
  Object.keys(groupedChannels).forEach((collection) => {
    groupedChannels[collection].sort((a, b) => (a.position || 0) - (b.position || 0))
  })

  const handleContextMenu = (e: React.MouseEvent, channelId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      channelId,
    })
  }

  const handleCollectionContextMenu = (e: React.MouseEvent, collection: string, collectionColor: string) => {
    e.preventDefault()
    e.stopPropagation()
    setCollectionContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      collection,
      collectionColor,
    })
  }

  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false })
  }

  const closeCollectionContextMenu = () => {
    setCollectionContextMenu({ ...collectionContextMenu, visible: false })
  }

  // Channel management functions
  const moveChannelUp = (channelId: string) => {
    console.log("Moving channel up:", channelId)
    const allChannels = [...channels]
    const channelIndex = allChannels.findIndex((c) => c.id === channelId)
    if (channelIndex <= 0) return // Already at the top

    const channel = allChannels[channelIndex]

    // Find the previous channel in the same collection or uncategorized section
    let prevIndex = channelIndex - 1
    while (prevIndex >= 0) {
      if (allChannels[prevIndex].collection === channel.collection) {
        break
      }
      prevIndex--
    }

    if (prevIndex < 0) return // No previous channel in the same collection

    // Swap positions
    const tempPosition = channel.position
    allChannels[channelIndex].position = allChannels[prevIndex].position
    allChannels[prevIndex].position = tempPosition

    // Sort and update
    setChannels([...allChannels])
  }

  const moveChannelDown = (channelId: string) => {
    console.log("Moving channel down:", channelId)
    const allChannels = [...channels]
    const channelIndex = allChannels.findIndex((c) => c.id === channelId)
    if (channelIndex >= allChannels.length - 1) return // Already at the bottom

    const channel = allChannels[channelIndex]

    // Find the next channel in the same collection or uncategorized section
    let nextIndex = channelIndex + 1
    while (nextIndex < allChannels.length) {
      if (allChannels[nextIndex].collection === channel.collection) {
        break
      }
      nextIndex++
    }

    if (nextIndex >= allChannels.length) return // No next channel in the same collection

    // Swap positions
    const tempPosition = channel.position
    allChannels[channelIndex].position = allChannels[nextIndex].position
    allChannels[nextIndex].position = tempPosition

    // Sort and update
    setChannels([...allChannels])
  }

  const addChannelToCollection = (channelId: string, collection: string) => {
    console.log(`Adding channel ${channelId} to collection ${collection}`)
    const updatedChannels = channels.map((channel) =>
      channel.id === channelId
        ? {
            ...channel,
            collection,
            // Use the collection color if it exists
            collectionColor: channels.find((c) => c.collection === collection)?.collectionColor || "#E0E0E0",
          }
        : channel,
    )
    setChannels(updatedChannels)
  }

  const createCollectionAndAdd = (channelId: string, collection: string) => {
    console.log(`Creating new collection ${collection} and adding channel ${channelId}`)
    // Generate a random pastel color for the new collection
    const hue = Math.floor(Math.random() * 360)
    const collectionColor = `hsl(${hue}, 70%, 85%)`

    const updatedChannels = channels.map((channel) =>
      channel.id === channelId
        ? {
            ...channel,
            collection,
            collectionColor,
          }
        : channel,
    )
    setChannels(updatedChannels)

    // Expand the new collection
    setExpandedCollections({
      ...expandedCollections,
      [collection]: true,
    })
  }

  const setChannelHighlightColor = (channelId: string, color: string) => {
    console.log(`Setting highlight color ${color} for channel ${channelId}`)
    const updatedChannels = channels.map((channel) =>
      channel.id === channelId
        ? {
            ...channel,
            highlightColor: color,
          }
        : channel,
    )
    setChannels(updatedChannels)
  }

  const deleteChannel = (channelId: string) => {
    console.log(`Deleting channel ${channelId}`)
    const updatedChannels = channels.filter((channel) => channel.id !== channelId)
    setChannels(updatedChannels)

    // If the deleted channel was selected, clear the selection
    if (selectedChannel === channelId) {
      setSelectedChannel("")
    }
  }

  // Collection management functions
  const renameCollection = (collection: string, newName: string) => {
    console.log(`Renaming collection ${collection} to ${newName}`)
    const updatedChannels = channels.map((channel) =>
      channel.collection === collection
        ? {
            ...channel,
            collection: newName,
          }
        : channel,
    )
    setChannels(updatedChannels)

    // Update expanded collections state
    setExpandedCollections({
      ...expandedCollections,
      [newName]: expandedCollections[collection] || false,
    })
  }

  const deleteCollection = (collection: string) => {
    console.log(`Deleting collection ${collection}`)
    const updatedChannels = channels.map((channel) =>
      channel.collection === collection
        ? {
            ...channel,
            collection: undefined,
            collectionColor: undefined,
          }
        : channel,
    )
    setChannels(updatedChannels)

    // Remove from expanded collections state
    const newExpandedCollections = { ...expandedCollections }
    delete newExpandedCollections[collection]
    setExpandedCollections(newExpandedCollections)
  }

  // Drag and drop handlers
  const handleDragStart = (id: string, collection?: string) => {
    setDraggedChannel({ id, collection })
    setIsDragging(true)
  }

  const handleDragOver = (id: string) => {
    if (!draggedChannel) return
    setDropTarget(id)
  }

  const handleDragEnd = () => {
    if (draggedChannel && dropTarget) {
      reorderChannel(draggedChannel.id, dropTarget)
    }
    setDraggedChannel(null)
    setDropTarget(null)
    setIsDragging(false)
  }

  const reorderChannel = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return

    const allChannels = [...channels]
    const draggedChannel = allChannels.find((c) => c.id === draggedId)
    const targetChannel = allChannels.find((c) => c.id === targetId)

    if (!draggedChannel || !targetChannel) return

    // Only allow reordering within the same collection
    if (draggedChannel.collection !== targetChannel.collection) return

    // Get all channels in the same collection (or uncategorized)
    const sameCollectionChannels = allChannels.filter((c) => c.collection === draggedChannel.collection)

    // Find the indices within the collection
    const draggedIndex = sameCollectionChannels.findIndex((c) => c.id === draggedId)
    const targetIndex = sameCollectionChannels.findIndex((c) => c.id === targetId)

    // Reorder positions
    const newPositions = [...sameCollectionChannels]
    const [removed] = newPositions.splice(draggedIndex, 1)
    newPositions.splice(targetIndex, 0, removed)

    // Update positions
    newPositions.forEach((channel, index) => {
      const originalIndex = allChannels.findIndex((c) => c.id === channel.id)
      if (originalIndex !== -1) {
        allChannels[originalIndex].position = (draggedChannel.collection ? 1000 : 0) + index
      }
    })

    // Update channels
    setChannels([...allChannels])
  }

  // Add global click handler to close context menus when clicking outside
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Don't close if clicking on a dialog
      const isClickingDialog = (e.target as Element)?.closest('[role="dialog"]')
      if (!isClickingDialog) {
        if (contextMenu.visible) {
          // Check if the click is on the context menu itself
          const contextMenuElement = document.querySelector("[data-context-menu='true']")
          if (!contextMenuElement || !contextMenuElement.contains(e.target as Node)) {
            closeContextMenu()
          }
        }
        if (collectionContextMenu.visible) {
          // Check if the click is on the collection context menu itself
          const collectionContextMenuElement = document.querySelector("[data-collection-context-menu='true']")
          if (!collectionContextMenuElement || !collectionContextMenuElement.contains(e.target as Node)) {
            closeCollectionContextMenu()
          }
        }
      }
    }

    document.addEventListener("click", handleGlobalClick)
    return () => {
      document.removeEventListener("click", handleGlobalClick)
    }
  }, [contextMenu.visible, collectionContextMenu.visible])

  return (
    <div className="py-2 font-mono overflow-y-auto max-h-[calc(100vh-120px)]">
      {/* Uncategorized channels */}
      <div className={cn("transition-all duration-200", isDragging && "opacity-70")}>
        {uncategorizedChannels.map((channel) => (
          <DraggableChannelItem
            key={channel.id}
            id={channel.id}
            name={channel.name}
            hasUnread={channel.hasUnread}
            isSelected={selectedChannel === channel.id}
            highlightColor={channel.highlightColor}
            onSelect={() => setSelectedChannel(channel.id)}
            onContextMenu={(e) => handleContextMenu(e, channel.id)}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      {/* Grouped channels by collection */}
      {Object.entries(groupedChannels).map(([collection, collectionChannels]) => (
        <div key={collection} style={{ backgroundColor: collectionChannels[0].collectionColor }}>
          <div
            className="flex items-center px-4 py-2 cursor-pointer font-semibold"
            onClick={() => toggleCollection(collection)}
            onContextMenu={(e) => handleCollectionContextMenu(e, collection, collectionChannels[0].collectionColor)}
          >
            {expandedCollections[collection] ? (
              <ChevronDown className="h-4 w-4 mr-1" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1" />
            )}
            <span>{collection}</span>
          </div>
          {expandedCollections[collection] && (
            <div className={cn("transition-all duration-200", isDragging && "opacity-70")}>
              {collectionChannels.map((channel) => (
                <DraggableChannelItem
                  key={channel.id}
                  id={channel.id}
                  name={channel.name}
                  hasUnread={channel.hasUnread}
                  isSelected={selectedChannel === channel.id}
                  highlightColor={channel.highlightColor}
                  collection={channel.collection}
                  onSelect={() => setSelectedChannel(channel.id)}
                  onContextMenu={(e) => handleContextMenu(e, channel.id)}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Channel Context Menu */}
      {contextMenu.visible && (
        <ChannelContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          channel={channels.find((c) => c.id === contextMenu.channelId)!}
          collections={collections}
          onClose={closeContextMenu}
          onMoveUp={moveChannelUp}
          onMoveDown={moveChannelDown}
          onAddToCollection={addChannelToCollection}
          onCreateCollection={createCollectionAndAdd}
          onSetHighlightColor={setChannelHighlightColor}
          onDelete={deleteChannel}
        />
      )}

      {/* Collection Context Menu */}
      {collectionContextMenu.visible && (
        <CollectionContextMenu
          x={collectionContextMenu.x}
          y={collectionContextMenu.y}
          collection={collectionContextMenu.collection}
          collectionColor={collectionContextMenu.collectionColor}
          onClose={closeCollectionContextMenu}
          onRename={renameCollection}
          onDelete={deleteCollection}
        />
      )}
    </div>
  )
}
