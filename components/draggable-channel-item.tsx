"use client"

import type React from "react"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { GripVertical } from "lucide-react"

interface DraggableChannelItemProps {
  id: string
  name: string
  hasUnread: boolean
  isSelected: boolean
  highlightColor?: string
  collection?: string
  onSelect: () => void
  onContextMenu: (e: React.MouseEvent) => void
  onDragStart: (id: string, collection?: string) => void
  onDragOver: (id: string) => void
  onDragEnd: () => void
}

export default function DraggableChannelItem({
  id,
  name,
  hasUnread,
  isSelected,
  highlightColor,
  collection,
  onSelect,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDragEnd,
}: DraggableChannelItemProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (e: React.DragEvent) => {
    // Set the drag data
    e.dataTransfer.setData("text/plain", id)
    e.dataTransfer.effectAllowed = "move"

    // If available, set a drag image
    if (dragRef.current) {
      const rect = dragRef.current.getBoundingClientRect()
      e.dataTransfer.setDragImage(dragRef.current, rect.width / 2, rect.height / 2)
    }

    setIsDragging(true)
    onDragStart(id, collection)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    onDragOver(id)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    onDragEnd()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    // The actual reordering is handled in the parent component
  }

  return (
    <div
      ref={dragRef}
      className={cn(
        "flex items-center px-4 py-2 cursor-pointer relative",
        isSelected ? "bg-black text-white" : "hover:bg-[#E0E0E0]",
        isDragging && "opacity-50",
      )}
      style={highlightColor && !isSelected ? { backgroundColor: highlightColor } : undefined}
      onClick={onSelect}
      onContextMenu={onContextMenu}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDrop={handleDrop}
    >
      <div className="w-6 flex justify-center">
        {hasUnread && <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>}
      </div>
      <span className="flex-1">{name}</span>
      {(isHovering || isDragging) && (
        <div className="flex items-center opacity-50 hover:opacity-100 cursor-grab">
          <GripVertical className="h-4 w-4" />
        </div>
      )}
    </div>
  )
}
