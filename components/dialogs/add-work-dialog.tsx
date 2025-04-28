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
import { Checkbox } from "@/components/ui/checkbox"

interface AddWorkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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
}

export default function AddWorkDialog({ open, onOpenChange, onAddWork }: AddWorkDialogProps) {
  const [workType, setWorkType] = useState("")
  const [url, setUrl] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [workspace, setWorkspace] = useState("")
  const [customName, setCustomName] = useState("")
  const [collection, setCollection] = useState("")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Generate a random pastel color for the collection
  const generateCollectionColor = () => {
    const hue = Math.floor(Math.random() * 360)
    return `hsl(${hue}, 70%, 85%)`
  }

  const handleAdd = () => {
    if (!workType || !url || !collection) return

    // Generate a unique ID for the new work tool
    const id = `work-${workType}-${Date.now()}`

    // Create a display name for the channel list
    let displayName = customName || `${workType.charAt(0).toUpperCase() + workType.slice(1)}`
    if (!displayName.startsWith("#")) {
      displayName = `#${displayName}`
    }

    // Add the work tool to the channel list
    onAddWork({
      id,
      name: displayName,
      type: workType,
      url,
      apiKey: apiKey || undefined,
      workspace: workspace || undefined,
      collection,
      collectionColor: generateCollectionColor(),
      notificationsEnabled,
    })

    // Reset form and close dialog
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setWorkType("")
    setUrl("")
    setApiKey("")
    setWorkspace("")
    setCustomName("")
    setCollection("")
    setNotificationsEnabled(true)
    setShowAdvanced(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Work Tool</DialogTitle>
          <DialogDescription>Connect a work tool or service to your dashboard.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="work-type" className="text-right">
              Tool Type
            </Label>
            <Select value={workType} onValueChange={setWorkType}>
              <SelectTrigger id="work-type" className="col-span-3">
                <SelectValue placeholder="Select work tool" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="jira">Jira</SelectItem>
                <SelectItem value="trello">Trello</SelectItem>
                <SelectItem value="asana">Asana</SelectItem>
                <SelectItem value="notion">Notion</SelectItem>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="gitlab">GitLab</SelectItem>
                <SelectItem value="zendesk">Zendesk</SelectItem>
                <SelectItem value="airtable">Airtable</SelectItem>
                <SelectItem value="figma">Figma</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              URL
            </Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="col-span-3"
              placeholder="https://your-workspace.example.com"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="collection" className="text-right">
              Collection
            </Label>
            <Input
              id="collection"
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Work, Client Name, Project Name"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="custom-name" className="text-right">
              Display Name
            </Label>
            <Input
              id="custom-name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="col-span-3"
              placeholder={`#${workType ? workType.charAt(0).toUpperCase() + workType.slice(1) : "Work"}`}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right">
              <Label htmlFor="notifications">Notifications</Label>
            </div>
            <div className="flex items-center space-x-2 col-span-3">
              <Checkbox
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={(checked) => setNotificationsEnabled(checked === true)}
              />
              <label
                htmlFor="notifications"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Enable notifications for new activity
              </label>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right">
              <Label htmlFor="advanced-settings">Advanced</Label>
            </div>
            <div className="flex items-center space-x-2 col-span-3">
              <Checkbox
                id="advanced-settings"
                checked={showAdvanced}
                onCheckedChange={(checked) => setShowAdvanced(checked === true)}
              />
              <label
                htmlFor="advanced-settings"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Show advanced API settings
              </label>
            </div>
          </div>

          {showAdvanced && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="api-key" className="text-right">
                  API Key
                </Label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="col-span-3"
                  placeholder="Your API key or token"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="workspace" className="text-right">
                  Workspace ID
                </Label>
                <Input
                  id="workspace"
                  value={workspace}
                  onChange={(e) => setWorkspace(e.target.value)}
                  className="col-span-3"
                  placeholder="Workspace ID or name (if applicable)"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleAdd} disabled={!workType || !url || !collection}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
