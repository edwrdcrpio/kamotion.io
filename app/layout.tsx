"use client" // Required for useState and useEffect hooks

import React, { useState } from "react"
import type { Metadata } from "next"
import { Inconsolata } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import LeftSidebar from "@/components/left-sidebar"
import ContentArea from "@/components/content-area"
import { useMediaQuery } from "@/hooks/use-media-query"

const inconsolata = Inconsolata({ subsets: ["latin"] })

export default function RootLayout({
  children, // children prop might not be directly used if ContentArea handles page content
}: Readonly<{
  children: React.ReactNode
}>) {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const isMobile = useMediaQuery("(max-width: 768px)") // Example breakpoint for mobile

  return (
    <html lang="en" suppressHydrationWarning> {/* Added suppressHydrationWarning for next-themes */}
      <head>
        {/* Removed direct font link, rely on Tailwind/NextFont */}
      </head>
      <body className={inconsolata.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="flex flex-col h-screen">
            <header className="h-16 border-b shrink-0"> {/* Adjusted styling */}
              <Header
                onAddLLM={() => console.log("Add LLM triggered")}
                onAddInbox={() => console.log("Add Inbox triggered")}
                onAddSocial={() => console.log("Add Social triggered")}
                onAddWork={() => console.log("Add Work triggered")}
                onAddNote={() => console.log("Add Note triggered")}
              />
            </header>
            <div className="flex flex-grow overflow-hidden"> {/* Added overflow-hidden */}
              <aside className="shrink-0 border-r"> {/* Adjusted styling */}
                <LeftSidebar
                  selectedChannel={selectedChannel}
                  setSelectedChannel={setSelectedChannel}
                  isMobile={isMobile}
                  // Pass empty arrays for now, will be replaced by fetched data later
                  customLLMs={[]}
                  inboxes={[]}
                  socials={[]}
                  works={[]}
                  notes={[]}
                />
              </aside>
              <main className="flex-grow overflow-y-auto"> {/* Adjusted styling */}
                <ContentArea
                  selectedChannel={selectedChannel}
                  // Pass empty arrays/dummy functions for now
                  customLLMs={[]}
                  onAddMessage={() => {}}
                  onAddConversation={() => undefined}
                />
                 {/* Render children here if ContentArea doesn't handle page routes */}
                 {/* {children} */}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
