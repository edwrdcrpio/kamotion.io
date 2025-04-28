"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ArrowUp, ArrowDown, Folder, Trash2, Circle, CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ConfirmDialog from "@/components/dialogs/confirm-dialog"

interface ChannelContextMenuProps {
  x: number
  y: number
  channel: {
    id: string
    name: string
    hasUnread: boolean
    collection?: string
    collectionColor?: string
    highlightColor?: string
  }
  collections: string[]
  onClose: () => void
  onMoveUp: (channelId: string) => void
  onMoveDown: (channelId: string) => void
  onAddToCollection: (channelId: string, collection: string) => void
  onCreateCollection: (channelId: string, collection: string) => void
  onSetHighlightColor: (channelId: string, color: string) => void
  onDelete: (channelId: string) => void
}

export default function ChannelContextMenu({
  x,
  y,
  channel,
  collections,
  onClose,
  onMoveUp,
  onMoveDown,
  onAddToCollection,
  onCreateCollection,
  onSetHighlightColor,
  onDelete,
}: ChannelContextMenuProps) {
  // State for submenus and dialogs
  const [activeSubmenu, setActiveSubmenu] = useState<"none" | "collection" | "color">("none")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [newCollection, setNewCollection] = useState("")
  const [isAddingNewCollection, setIsAddingNewCollection] = useState(false)

  // Refs for DOM elements
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Available colors for highlighting
  const colors = [
    { name: "None", value: "" },
    { name: "Red", value: "#FFCDD2" },
    { name: "Orange", value: "#FFE0B2" },
    { name: "Yellow", value: "#FFF9C4" },
    { name: "Green", value: "#C8E6C9" },
    { name: "Blue", value: "#BBDEFB" },
    { name: "Purple", value: "#E1BEE7" },
    { name: "Pink", value: "#F8BBD0" },
    { name: "Gray", value: "#E0E0E0" },
  ]

  // Adjust position to ensure menu stays within viewport
  const [menuPosition, setMenuPosition] = useState({ x, y })

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let adjustedX = x
      let adjustedY = y

      // Adjust horizontal position if menu would go off-screen
      if (x + rect.width > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10
      }

      // Adjust vertical position if menu would go off-screen
      if (y + rect.height > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 10
      }

      setMenuPosition({ x: adjustedX, y: adjustedY })
    }
  }, [x, y])

  // Focus the input when adding a new collection
  useEffect(() => {
    if (isAddingNewCollection && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAddingNewCollection])

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking inside the menu or its submenus
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // Check if we're clicking on a dialog (like the delete confirmation)
        const isClickingDialog = (event.target as Element)?.closest('[role="dialog"]')
        if (!isClickingDialog) {
          onClose()
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  const handleAddToNewCollection = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (newCollection.trim()) {
      console.log("Creating new collection:", newCollection.trim())
      onCreateCollection(channel.id, newCollection.trim())
      setNewCollection("")
      setIsAddingNewCollection(false)
      onClose()
    }
  }

  const handleAddToCollection = (e: React.MouseEvent, collection: string) => {
    e.stopPropagation()
    console.log("Adding to collection:", collection)
    onAddToCollection(channel.id, collection)
    onClose()
  }

  const handleSetHighlightColor = (e: React.MouseEvent, color: string) => {
    e.stopPropagation()
    console.log("Setting highlight color:", color)
    onSetHighlightColor(channel.id, color)
    onClose()
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Opening delete dialog")
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    console.log("Confirming delete for channel:", channel.id)
    onDelete(channel.id)
    setIsDeleteDialogOpen(false)
    onClose()
  }

  const toggleSubmenu = (e: React.MouseEvent, submenu: "collection" | "color") => {
    e.stopPropagation()
    setActiveSubmenu(activeSubmenu === submenu ? "none" : submenu)
  }

  // Calculate submenu position
  const getSubmenuStyle = () => {
    if (!menuRef.current) return {}

    const rect = menuRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth

    // If menu is on the right side of the screen, show submenu to the left
    if (rect.right + 200 > viewportWidth) {
      return { right: "100%", top: "0", left: "auto" }
    }

    // Otherwise show to the right
    return { left: "100%", top: "0" }
  }

  return (
    <>
      <div
        ref={menuRef}
        className="fixed bg-white rounded-md shadow-lg border border-gray-200 w-56 z-50"
        style={{
          left: `${menuPosition.x}px`,
          top: `${menuPosition.y}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-1">
          {/* Channel name header */}
          <div className="px-4 py-2 text-sm font-medium border-b">{channel.name}</div>

          {/* Move options */}
          <button
            className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation()
              console.log("Moving up:", channel.id)
              onMoveUp(channel.id)
              onClose()
            }}
          >
            <ArrowUp className="mr-2 h-4 w-4" />
            Move Up
          </button>
          <button
            className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation()
              console.log("Moving down:", channel.id)
              onMoveDown(channel.id)
              onClose()
            }}
          >
            <ArrowDown className="mr-2 h-4 w-4" />
            Move Down
          </button>

          <div className="border-t my-1"></div>

          {/* Collection submenu */}
          <div className="relative">
            {isAddingNewCollection ? (
              <div className="px-4 py-2 flex items-center">
                <Input
                  ref={inputRef}
                  value={newCollection}
                  onChange={(e) => setNewCollection(e.target.value)}
                  placeholder="Collection name"
                  className="h-8 text-sm"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddToNewCollection(e as unknown as React.MouseEvent)
                    } else if (e.key === "Escape") {
                      setIsAddingNewCollection(false)
                    }
                  }}
                />
                <Button size="icon" variant="ghost" className="h-8 w-8 ml-1" onClick={handleAddToNewCollection}>
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsAddingNewCollection(false)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <button
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 justify-between"
                  onClick={(e) => toggleSubmenu(e, "collection")}
                >
                  <div className="flex items-center">
                    <Folder className="mr-2 h-4 w-4" />
                    Add to Collection
                  </div>
                  <span>{activeSubmenu === "collection" ? "▼" : "▶"}</span>
                </button>

                {activeSubmenu === "collection" && (
                  <div
                    className="absolute bg-white border border-gray-200 rounded-md shadow-sm py-1 w-56 z-50"
                    style={getSubmenuStyle()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {collections.length > 0 ? (
                      collections.map((collection) => (
                        <button
                          key={collection}
                          className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
                          onClick={(e) => handleAddToCollection(e, collection)}
                        >
                          {collection}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">No collections</div>
                    )}
                    <div className="border-t my-1"></div>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsAddingNewCollection(true)
                        setActiveSubmenu("none")
                      }}
                    >
                      Create New Collection...
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Highlight color submenu */}
          <div className="relative">
            <button
              className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 justify-between"
              onClick={(e) => toggleSubmenu(e, "color")}
            >
              <div className="flex items-center">
                <Circle
                  className="mr-2 h-4 w-4"
                  style={{
                    fill: channel.highlightColor || "transparent",
                    stroke: channel.highlightColor ? channel.highlightColor : "currentColor",
                  }}
                />
                Highlight Color
              </div>
              <span>{activeSubmenu === "color" ? "▼" : "▶"}</span>
            </button>

            {activeSubmenu === "color" && (
              <div
                className="absolute bg-white border border-gray-200 rounded-md shadow-sm p-2 z-50"
                style={getSubmenuStyle()}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="grid grid-cols-3 gap-1">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-100"
                      onClick={(e) => handleSetHighlightColor(e, color.value)}
                    >
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300 relative"
                        style={{ backgroundColor: color.value || "transparent" }}
                      >
                        {channel.highlightColor === color.value && (
                          <CheckCircle2 className="absolute inset-0 h-6 w-6 text-primary" />
                        )}
                      </div>
                      <span className="text-xs mt-1">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t my-1"></div>

          {/* Delete option */}
          <button
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            onClick={handleDeleteClick}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Channel
          </button>
        </div>
      </div>

      {/* Confirmation dialog for delete */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Channel"
        description={`Are you sure you want to delete "${channel.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
