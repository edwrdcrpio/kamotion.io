"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface CreateChannelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collections: string[]
  onCreateChannel: (name: string, collection?: string) => void
}

export default function CreateChannelDialog({
  open,
  onOpenChange,
  collections,
  onCreateChannel,
}: CreateChannelDialogProps) {
  const [channelName, setChannelName] = useState("")
  const [selectedCollection, setSelectedCollection] = useState<string>("")

  const handleCreate = () => {
    if (!channelName.trim()) return

    onCreateChannel(channelName.trim(), selectedCollection === "none" ? undefined : selectedCollection || undefined)

    // Reset form
    setChannelName("")
    setSelectedCollection("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Channel</DialogTitle>
          <DialogDescription>Add a new channel to your sidebar.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="channel-name" className="text-right">
              Name
            </Label>
            <Input
              id="channel-name"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Inbox: Gmail, #Twitter"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="collection" className="text-right">
              Collection
            </Label>
            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
              <SelectTrigger id="collection" className="col-span-3">
                <SelectValue placeholder="Select collection (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection} value={collection}>
                    {collection}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleCreate} disabled={!channelName.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
