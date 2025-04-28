"use client"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"

interface AddLLMDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddLLM: (llm: {
    id: string
    name: string
    provider: string
    model: string
    apiKey: string
    customInstructions: string
    initialConversation: {
      id: string
      title: string
      messages: Array<{
        id: string
        sender: "user" | "bot"
        content: string
        timestamp: string
      }>
    }
  }) => void
}

// Model options by provider
const modelOptions: Record<string, string[]> = {
  openai: ["gpt-4o", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
  anthropic: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku", "claude-2"],
  google: ["gemini-pro", "gemini-ultra", "palm-2"],
  mistral: ["mistral-large", "mistral-medium", "mistral-small", "mixtral-8x7b"],
  custom: ["custom-model"],
}

export default function AddLLMDialog({ open, onOpenChange, onAddLLM }: AddLLMDialogProps) {
  const [apiProvider, setApiProvider] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [model, setModel] = useState("")
  const [customInstructions, setCustomInstructions] = useState("")
  const [llmName, setLlmName] = useState("")

  // Reset model when API provider changes
  useEffect(() => {
    setModel("")
  }, [apiProvider])

  const handleAdd = () => {
    if (!apiProvider || !apiKey || !model) return

    // Generate a unique ID for the new LLM
    const id = `llm-${apiProvider}-${Date.now()}`

    // Create a display name for the channel list, ensuring it has a # prefix
    let displayName = llmName || model
    if (!displayName.startsWith("#")) {
      displayName = `#${displayName}`
    }

    // Create an initial conversation for the new LLM
    const initialConversation = {
      id: `conv-${Date.now()}`,
      title: "New Conversation",
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: "bot" as const,
          content: `Hello! I'm your ${model} assistant. How can I help you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    }

    // Add the LLM to the channel list with its initial conversation
    onAddLLM({
      id,
      name: displayName,
      provider: apiProvider,
      model,
      apiKey,
      customInstructions,
      initialConversation,
    })

    // Reset form and close dialog
    resetForm()
    onOpenChange(false)
  }

  const handleCancel = () => {
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setApiProvider("")
    setApiKey("")
    setModel("")
    setCustomInstructions("")
    setLlmName("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add LLM</DialogTitle>
          <DialogDescription>Configure a new Large Language Model connection.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="llm-name" className="text-right">
              Name
            </Label>
            <Input
              id="llm-name"
              value={llmName}
              onChange={(e) => setLlmName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., My Assistant (# will be added automatically)"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-provider" className="text-right">
              API Provider
            </Label>
            <Select value={apiProvider} onValueChange={setApiProvider}>
              <SelectTrigger id="api-provider" className="col-span-3">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google AI</SelectItem>
                <SelectItem value="mistral">Mistral AI</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
              placeholder="Enter your API key"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">
              Model
            </Label>
            <Select value={model} onValueChange={setModel} disabled={!apiProvider}>
              <SelectTrigger id="model" className="col-span-3">
                <SelectValue placeholder={apiProvider ? "Select model" : "Select a provider first"} />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                {apiProvider &&
                  modelOptions[apiProvider]?.map((modelOption) => (
                    <SelectItem key={modelOption} value={modelOption}>
                      {modelOption}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="custom-instructions" className="text-right pt-2">
              Custom Instructions
            </Label>
            <Textarea
              id="custom-instructions"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="col-span-3 h-24"
              placeholder="Enter custom instructions for your LLM"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-end">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleAdd}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
