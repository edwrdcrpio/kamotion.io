"use client"

import { useState, useRef, useEffect } from "react"
import { Edit, Trash2, X, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ConfirmDialog from "@/components/dialogs/confirm-dialog"

interface CollectionContextMenuProps {
  x: number
  y: number
  collection: string
  collectionColor: string
  onClose: () => void
  onRename: (collection: string, newName: string) => void
  onDelete: (collection: string) => void
}

export default function CollectionContextMenu({
  x,
  y,
  collection,
  collectionColor,
  onClose,
  onRename,
  onDelete,
}: CollectionContextMenuProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(collection)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  // Focus the input when renaming
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])

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

  const handleRename = () => {
    if (newName.trim() && newName !== collection) {
      console.log(`Renaming collection ${collection} to ${newName}`)
      onRename(collection, newName.trim())
      onClose()
    } else {
      setNewName(collection)
      setIsRenaming(false)
    }
  }

  const handleDeleteClick = () => {
    console.log("Opening delete dialog for collection:", collection)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    console.log("Confirming delete for collection:", collection)
    onDelete(collection)
    setIsDeleteDialogOpen(false)
    onClose()
  }

  return (
    <>
      <div
        ref={menuRef}
        className="fixed bg-white rounded-md shadow-lg border border-gray-200 w-56 z-[200]"
        style={{
          left: `${menuPosition.x}px`,
          top: `${menuPosition.y}px`,
          backgroundColor: collectionColor,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-1">
          {/* Collection name header */}
          <div className="px-4 py-2 text-sm font-medium border-b">{collection}</div>

          {/* Rename option */}
          {isRenaming ? (
            <div className="px-4 py-2 flex items-center">
              <Input
                ref={inputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Collection name"
                className="h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRename()
                  } else if (e.key === "Escape") {
                    setIsRenaming(false)
                    setNewName(collection)
                  }
                }}
              />
              <Button size="icon" variant="ghost" className="h-8 w-8 ml-1" onClick={handleRename}>
                <CheckCircle2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => {
                  setIsRenaming(false)
                  setNewName(collection)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <button
              className="flex items-center w-full px-4 py-2 text-sm hover:bg-opacity-20 hover:bg-black"
              onClick={() => setIsRenaming(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Rename Collection
            </button>
          )}

          {/* Delete option */}
          <button
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-opacity-20 hover:bg-black"
            onClick={handleDeleteClick}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Collection
          </button>
        </div>
      </div>

      {/* Confirmation dialog for delete */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Collection"
        description={`Are you sure you want to delete the "${collection}" collection? All channels in this collection will be moved to uncategorized.`}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
