# Kamotion.io UI Design Specification

## Overview

Kamotion.io is a web application that aggregates various communication channels and productivity tools into a single interface, including email inboxes (e.g., Gmail, Outlook, iCloud), social media notifications, work platforms (e.g., Slack), AI chatbots (e.g., OpenAI, Anthropic, Gemini), and a notes feature. This document outlines the UI design to ensure a clear, developer-friendly specification.

## Layout

The interface is divided into four main sections:

1. **Header**
2. **Left Sidebar (Channel Navigation)**
3. **Central Content Area**
4. **Right Sidebar (Optional)**

### Header

- **Logo**: Positioned in the top-left corner. Use a placeholder "K" icon (e.g., a "K" in a circle) followed by "kamotion.io" in the "Flyover" font. If "Flyover" is unavailable, fallback to "Arial" or "Helvetica."
- **Location Display**: To the right of the logo, show "71° San Diego, CA" in a smaller font (e.g., 12px). This can be static or dynamically updated based on user location.
- **Menu Button**: A vertical three-dot icon (⋮) on the far right. Clicking it opens a dropdown menu or toggles the right sidebar with options:
  - Account
  - Add Inbox
  - Add Social
  - Add Work
  - Add Note
  - Settings
  - Help
  - Logout

### Left Sidebar (Channel Navigation)

- **Width**: 30-35% of the screen width.
- **Search Bar**: At the top, featuring a magnifying glass icon. Filters channels as the user types.
- **Channel List**: Organized into categories and collections:
  - **Categories**: Inbox, Social, AI/LLM, Notes.
  - **Collections**: User-defined groups (e.g., "Job 1," "Job 2"), collapsible/expandable with headers.
  - **Channel Format**: Each channel displays a name (e.g., "Inbox: Gmail," "#ChatGPT"), optional icon, and a red notification dot (6px diameter) for unread items.
- **Styling**:
  - Background: Light gray (#F5F5F5)
  - Text: Black (#000000).
  - Font: "Inconsolata" (14-16px)

### Central Content Area

- **Width**: 65-70% of the screen width.
- **Content Display**: Varies by selected channel:
  - **Email Channels**: Two-column layout:
    - Middle: Email list (sender, subject, snippet, timestamp, read/unread status) displayed in a card format.
    - Right: Full email content (headers, body, attachments, reply/forward/delete buttons).
    - Additional: Compose button for new emails.
  - **AI Chatbot Channels**: Two-column layout:
    - Middle: Chat history (user and bot messages).
    - Right: Chatbot interface (text area, send button).
  - **Notes**: Two-column layout:
    - Middle: Notes list (titles).
    - Right: Note editor (title input, content textarea, save/delete buttons), opens when a note title is clicked in the middle pane.
  - **Other Channels (e.g., Social, Slack)**: Single-column list of notifications/messages; consider two-column for consistency if feasible.
- **Default State**: White background (#FFFFFF) when no channel is selected.

### Right Sidebar

- **Width**: 15-20% of the screen width (if fixed).
- **Behavior**: Can be a dropdown (triggered by the header’s three-dot icon) or a fixed panel in a three-column layout.
- **Content**: Mirrors the header menu options:
  - Account
  - Add Inbox
  - Add Social
  - Add Work
  - Add Note
  - Settings
  - Help
  - Logout
- **Interaction**: Clicking an option opens a form or dialog (e.g., OAuth for adding inboxes).
- **Styling**: Light gray background (#F5F5F5), black text (#000000).

## Context Menu

- **Trigger**: Right-click on a channel in the left sidebar.
- **Options**:
  - Add to Collection
  - Change Color
  - Rename
  - Move
  - Settings
- **Implementation**: Use JavaScript event listeners to display a custom menu.

## Layout Modes

- **Two-Column Mode**: Default, with sidebar and content area side by side.
- **One-Column Mode**: Sidebar and content stacked vertically; sidebar may overlay or hide.
- **Toggle**: Include a switch mechanism (e.g., settings option or header button).

## Responsiveness

- **Small Screens**: Switch to one-column mode.
- **Sidebar**: Hide behind a hamburger menu.
- **Adjustments**: Scale font sizes and padding for mobile usability.

## Styling

- **Fonts**:
  - Main: "Inconsolata"
  - Logo: "Flyover" (fallback: "Arial" or "Helvetica")

- **Colors for Collections (Example)**:
  - "Job 1": #ADD8E6 (Light Blue)
  - "Job 2": #DDA0DD (Lavender)
  -  Other collections: Use a consistent, visually distinct color palette.


- **Borders**: Light gray (#E0E0E0) between panels.
- **States**:
  - Hover: Subtle background change (e.g., #E0E0E0).
  - Active: Highlight with border or background (e.g., #D3D3D3).

## Channel-Specific UI Elements

- **Email View**:
  - Email List: Sender, subject, snippet, timestamp, read/unread toggle.
  - Email Content: Full email display with action buttons.
  - Compose: Button to open a new email window.
- **AI Chatbot View**:
  - Chat History: Sequential list of messages.
  - Chat Input: Text area with send button.
- **Notes View**:
  - Notes List: Clickable titles or previews.
  - Note Editor: Editable title and content fields, save/delete options.
- **Slack View** (if integrated):
  - Channel/DM List: Sidebar-like list of Slack channels/messages.
  - Conversation: Message history and input field.

## Additional Features

- **Resizable Panes**: In a three-column layout, allow resizing of sidebar, content, and right sidebar widths.
- **Accessibility**: Ensure high contrast, keyboard navigation, and ARIA attributes.

## Placeholder for Logo

- Use a simple "K" in a circle (or similar) as a placeholder for the "K" icon.
- Pair with "kamotion.io" in "Flyover" font (or fallback font if unavailable).

This specification provides a clear blueprint for developers to implement the Kamotion.io UI, ensuring a consistent and functional user experience.