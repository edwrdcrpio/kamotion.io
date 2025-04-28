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

interface AddSocialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddSocial: (social: {
    id: string
    name: string
    platform: string
    username: string
    accessToken?: string
    refreshToken?: string
    notificationsEnabled: boolean
    contentTypes: string[]
  }) => void
}

export default function AddSocialDialog({ open, onOpenChange, onAddSocial }: AddSocialDialogProps) {
  const [platform, setPlatform] = useState("")
  const [username, setUsername] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [refreshToken, setRefreshToken] = useState("")
  const [customName, setCustomName] = useState("")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [contentTypes, setContentTypes] = useState<string[]>(["posts", "messages"])

  // Content type options by platform
  const platformContentTypes: Record<string, string[]> = {
    twitter: ["tweets", "replies", "mentions", "messages"],
    instagram: ["posts", "stories", "reels", "messages"],
    facebook: ["posts", "events", "messages", "notifications"],
    linkedin: ["posts", "jobs", "messages", "notifications"],
    reddit: ["posts", "comments", "messages", "notifications"],
    tiktok: ["videos", "comments", "messages"],
    youtube: ["videos", "comments", "livestreams", "notifications"],
    discord: ["messages", "mentions", "announcements"],
    slack: ["messages", "mentions", "channels"],
  }

  const handleContentTypeChange = (type: string) => {
    setContentTypes((current) => {
      if (current.includes(type)) {
        return current.filter((t) => t !== type)
      } else {
        return [...current, type]
      }
    })
  }

  const handleAdd = () => {
    if (!platform || !username) return

    // Generate a unique ID for the new social account
    const id = `social-${platform}-${Date.now()}`

    // Create a display name for the channel list
    let displayName = customName || `${platform.charAt(0).toUpperCase() + platform.slice(1)}`
    if (!displayName.startsWith("#")) {
      displayName = `#${displayName}`
    }

    // Add the social account to the channel list
    onAddSocial({
      id,
      name: displayName,
      platform,
      username,
      accessToken: accessToken || undefined,
      refreshToken: refreshToken || undefined,
      notificationsEnabled,
      contentTypes,
    })

    // Reset form and close dialog
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setPlatform("")
    setUsername("")
    setAccessToken("")
    setRefreshToken("")
    setCustomName("")
    setNotificationsEnabled(true)
    setShowAdvanced(false)
    setContentTypes(["posts", "messages"])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Social Media Account</DialogTitle>
          <DialogDescription>Connect a social media account to your dashboard.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="social-platform" className="text-right">
              Platform
            </Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger id="social-platform" className="col-span-3">
                <SelectValue placeholder="Select social platform" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="reddit">Reddit</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="discord">Discord</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="col-span-3"
              placeholder="Your username or handle"
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
              placeholder={`#${platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : "Social"}`}
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
                <Label htmlFor="access-token" className="text-right">
                  Access Token
                </Label>
                <Input
                  id="access-token"
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="col-span-3"
                  placeholder="Your API access token"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="refresh-token" className="text-right">
                  Refresh Token
                </Label>
                <Input
                  id="refresh-token"
                  type="password"
                  value={refreshToken}
                  onChange={(e) => setRefreshToken(e.target.value)}
                  className="col-span-3"
                  placeholder="Your API refresh token (if applicable)"
                />
              </div>
            </>
          )}

          {platform && platformContentTypes[platform] && (
            <div className="grid grid-cols-4 items-start gap-4">
              <div className="text-right pt-2">
                <Label>Content Types</Label>
              </div>
              <div className="col-span-3 space-y-2">
                {platformContentTypes[platform].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`content-type-${type}`}
                      checked={contentTypes.includes(type)}
                      onCheckedChange={() => handleContentTypeChange(type)}
                    />
                    <label
                      htmlFor={`content-type-${type}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleAdd} disabled={!platform || !username}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
