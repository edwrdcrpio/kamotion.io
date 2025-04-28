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

interface AddInboxDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddInbox: (inbox: {
    id: string
    name: string
    provider: string
    email: string
    password: string
    serverSettings: {
      incomingServer: string
      outgoingServer: string
      incomingPort: number
      outgoingPort: number
    }
    syncFrequency: string
    notificationsEnabled: boolean
  }) => void
}

export default function AddInboxDialog({ open, onOpenChange, onAddInbox }: AddInboxDialogProps) {
  const [provider, setProvider] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [customName, setCustomName] = useState("")
  const [syncFrequency, setSyncFrequency] = useState("realtime")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [incomingServer, setIncomingServer] = useState("")
  const [outgoingServer, setOutgoingServer] = useState("")
  const [incomingPort, setIncomingPort] = useState("")
  const [outgoingPort, setOutgoingPort] = useState("")

  // Provider settings presets
  const providerSettings: Record<
    string,
    { incomingServer: string; outgoingServer: string; incomingPort: number; outgoingPort: number }
  > = {
    gmail: {
      incomingServer: "imap.gmail.com",
      outgoingServer: "smtp.gmail.com",
      incomingPort: 993,
      outgoingPort: 587,
    },
    outlook: {
      incomingServer: "outlook.office365.com",
      outgoingServer: "smtp.office365.com",
      incomingPort: 993,
      outgoingPort: 587,
    },
    yahoo: {
      incomingServer: "imap.mail.yahoo.com",
      outgoingServer: "smtp.mail.yahoo.com",
      incomingPort: 993,
      outgoingPort: 587,
    },
    apple: {
      incomingServer: "imap.mail.me.com",
      outgoingServer: "smtp.mail.me.com",
      incomingPort: 993,
      outgoingPort: 587,
    },
    custom: {
      incomingServer: "",
      outgoingServer: "",
      incomingPort: 993,
      outgoingPort: 587,
    },
  }

  // Update server settings when provider changes
  const handleProviderChange = (value: string) => {
    setProvider(value)
    if (value !== "custom" && providerSettings[value]) {
      setIncomingServer(providerSettings[value].incomingServer)
      setOutgoingServer(providerSettings[value].outgoingServer)
      setIncomingPort(providerSettings[value].incomingPort.toString())
      setOutgoingPort(providerSettings[value].outgoingPort.toString())
    } else if (value === "custom") {
      setShowAdvanced(true)
      setIncomingServer("")
      setOutgoingServer("")
      setIncomingPort("993")
      setOutgoingPort("587")
    }
  }

  const handleAdd = () => {
    if (!provider || !email) return

    // Generate a unique ID for the new inbox
    const id = `inbox-${provider}-${Date.now()}`

    // Create a display name for the channel list
    let displayName = customName || `Inbox: ${provider.charAt(0).toUpperCase() + provider.slice(1)}`
    if (!displayName.startsWith("#")) {
      displayName = `#${displayName}`
    }

    // Add the inbox to the channel list
    onAddInbox({
      id,
      name: displayName,
      provider,
      email,
      password,
      serverSettings: {
        incomingServer: incomingServer || providerSettings[provider].incomingServer,
        outgoingServer: outgoingServer || providerSettings[provider].outgoingServer,
        incomingPort: Number.parseInt(incomingPort) || providerSettings[provider].incomingPort,
        outgoingPort: Number.parseInt(outgoingPort) || providerSettings[provider].outgoingPort,
      },
      syncFrequency,
      notificationsEnabled,
    })

    // Reset form and close dialog
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setProvider("")
    setEmail("")
    setPassword("")
    setCustomName("")
    setSyncFrequency("realtime")
    setNotificationsEnabled(true)
    setShowAdvanced(false)
    setIncomingServer("")
    setOutgoingServer("")
    setIncomingPort("")
    setOutgoingPort("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Email Inbox</DialogTitle>
          <DialogDescription>Connect an email account to your dashboard.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email-provider" className="text-right">
              Provider
            </Label>
            <Select value={provider} onValueChange={handleProviderChange}>
              <SelectTrigger id="email-provider" className="col-span-3">
                <SelectValue placeholder="Select email provider" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem value="gmail">Gmail</SelectItem>
                <SelectItem value="outlook">Outlook</SelectItem>
                <SelectItem value="yahoo">Yahoo</SelectItem>
                <SelectItem value="apple">Apple Mail</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email-address" className="text-right">
              Email
            </Label>
            <Input
              id="email-address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              placeholder="your.email@example.com"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email-password" className="text-right">
              Password
            </Label>
            <Input
              id="email-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
              placeholder="Your email password or app password"
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
              placeholder={`Inbox: ${provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "Email"}`}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sync-frequency" className="text-right">
              Sync
            </Label>
            <Select value={syncFrequency} onValueChange={setSyncFrequency}>
              <SelectTrigger id="sync-frequency" className="col-span-3">
                <SelectValue placeholder="Select sync frequency" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem value="realtime">Real-time</SelectItem>
                <SelectItem value="5min">Every 5 minutes</SelectItem>
                <SelectItem value="15min">Every 15 minutes</SelectItem>
                <SelectItem value="30min">Every 30 minutes</SelectItem>
                <SelectItem value="1hour">Every hour</SelectItem>
                <SelectItem value="manual">Manual only</SelectItem>
              </SelectContent>
            </Select>
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
                Enable notifications for new emails
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
                Show advanced server settings
              </label>
            </div>
          </div>

          {showAdvanced && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="incoming-server" className="text-right">
                  IMAP Server
                </Label>
                <Input
                  id="incoming-server"
                  value={incomingServer}
                  onChange={(e) => setIncomingServer(e.target.value)}
                  className="col-span-3"
                  placeholder="imap.example.com"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="incoming-port" className="text-right">
                  IMAP Port
                </Label>
                <Input
                  id="incoming-port"
                  value={incomingPort}
                  onChange={(e) => setIncomingPort(e.target.value)}
                  className="col-span-3"
                  placeholder="993"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="outgoing-server" className="text-right">
                  SMTP Server
                </Label>
                <Input
                  id="outgoing-server"
                  value={outgoingServer}
                  onChange={(e) => setOutgoingServer(e.target.value)}
                  className="col-span-3"
                  placeholder="smtp.example.com"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="outgoing-port" className="text-right">
                  SMTP Port
                </Label>
                <Input
                  id="outgoing-port"
                  value={outgoingPort}
                  onChange={(e) => setOutgoingPort(e.target.value)}
                  className="col-span-3"
                  placeholder="587"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleAdd} disabled={!provider || !email}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
