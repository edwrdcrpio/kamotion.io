# Kamotion.io UI Design Specification

## Overview

Kamotion.io is a web application that aggregates various communication channels and productivity tools into a single interface, including email inboxes (e.g., Gmail, Outlook, Apple Mail), social media platforms, work tools (e.g., Slack, Zendesk, Airtable), AI chatbots (e.g., ChatGPT, Grok, custom LLMs), and a notes feature. This document outlines the UI design and implementation details for the Kamotion.io platform.

## Layout

The interface is divided into three main sections:

1. **Header**
2. **Left Sidebar (Channel Navigation)**
3. **Central Content Area**

### Header

- **Logo**: Positioned in the top-left corner. Uses the official Kamotion logo (a stylized "K") followed by "kamotion.io" in the "Inconsolata" monospace font.
- **Location Display**: To the right of the logo, shows "71° San Diego, CA" in a smaller font. This is currently static but could be dynamically updated based on user location.
- **Menu Button**: A menu icon on the far right. Clicking it opens a dropdown menu with options:
  - Account
  - Add Inbox
  - Add Social
  - Add LLM
  - Add Work
  - Add Note
  - Settings
  - Help
  - Logout

### Left Sidebar (Channel Navigation)

- **Width**: Approximately 35% of the screen width, resizable by the user.
- **Search Bar**: At the top, featuring a magnifying glass icon and a "+" button to create new channels. Filters channels as the user types.
- **Channel List**: Organized into uncategorized channels and collections:
  - **Uncategorized Channels**: Default channels like "Inbox: Outlook", "#Instagram", "#ChatGPT", etc.
  - **Collections**: User-defined groups (e.g., "Job 1," "Job 2"), collapsible/expandable with headers.
  - **Channel Format**: Each channel displays a name (e.g., "Inbox: Gmail," "#ChatGPT") and a red notification dot (1.5px diameter) for unread items.
- **Context Menu**: Right-click on a channel to access options like Move Up, Move Down, Add to Collection, Set Highlight Color, and Delete.
- **Drag and Drop**: Channels can be reordered within their section using drag and drop.
- **Styling**:
  - Background: Light gray (#F5F5F5)
  - Text: Black (#000000)
  - Font: "Inconsolata" monospace
  - Selected Channel: Black background with white text

### Central Content Area

- **Width**: 65-70% of the screen width (or whatever remains after the sidebar).
- **Content Display**: Varies by selected channel type:
  - **Email Channels**: Two-column layout with resizable divider:
    - Left: Email list (sender, subject, snippet, timestamp, read/unread status).
    - Right: Full email content (headers, body, reply area).
  - **Chat Channels**: Two-column layout with resizable divider:
    - Left: Conversation list (title, last message, timestamp).
    - Right: Chat interface (message history, input field).
  - **Notes**: Two-column layout with resizable divider:
    - Left: Notes list (title, snippet, timestamp).
    - Right: Note editor (title input, content textarea, save/delete buttons).
  - **Social**: Single-column feed of posts with interaction buttons.
- **Default State**: Message to select a channel when no channel is selected.

## Dialog System

- **Add LLM Dialog**: Form to configure and add a custom LLM:
  - Name
  - API Provider (OpenAI, Anthropic, Google AI, Mistral AI)
  - API Key
  - Model selection
  - Custom instructions
- **Add Inbox Dialog**: Form to configure and add an email inbox:
  - Provider (Gmail, Outlook, Yahoo, Apple Mail)
  - Email address
  - Password
  - Display name
  - Sync frequency
  - Notifications toggle
  - Advanced server settings
- **Add Social Dialog**: Form to configure and add a social media account:
  - Platform (Twitter, Instagram, Facebook, etc.)
  - Username
  - Display name
  - Notifications toggle
  - Content types to display
  - Advanced API settings
- **Add Work Dialog**: Form to configure and add a work tool:
  - Tool type (Slack, Jira, Trello, etc.)
  - URL
  - Collection
  - Display name
  - Notifications toggle
  - Advanced API settings
- **Add Note Dialog**: Form to create a new note:
  - Title
  - Category
  - Content
  - Tags
  - Pin option
- **Confirm Dialog**: Confirmation for destructive actions like deleting channels or collections.

## Context Menus

### Channel Context Menu
- **Trigger**: Right-click on a channel in the left sidebar.
- **Options**:
  - Move Up
  - Move Down
  - Add to Collection (submenu)
  - Highlight Color (submenu with color options)
  - Delete Channel
- **Implementation**: Custom context menu component with submenus.

### Collection Context Menu
- **Trigger**: Right-click on a collection header.
- **Options**:
  - Rename Collection
  - Delete Collection
- **Implementation**: Custom context menu component.

## Responsiveness

- **Desktop**: Full layout with resizable sidebar and content areas.
- **Mobile**: Responsive design that adapts to smaller screens:
  - Sidebar becomes full-width and can be toggled
  - Content area becomes full-width when sidebar is hidden
  - UI elements scale appropriately for touch interaction

## Styling

- **Fonts**:
  - Main: "Inconsolata" monospace
  - Fallback: System fonts
- **Colors**:
  - Sidebar: #F5F5F5
  - Content Area: #FFFFFF
  - Text: #000000
  - Selected Channel: #000000 (background), #FFFFFF (text)
  - Collection Colors: Custom colors for different collections (e.g., #ADD8E6 for Job 1, #DDA0DD for Job 2)
  - Highlight Colors: Various pastel colors for channel highlighting
  - Notification Dots: #FF0000
- **Borders**: Light gray borders between sections and list items.
- **States**:
  - Hover: Light gray background (#E0E0E0)
  - Selected: Black background with white text

## Channel-Specific UI Elements

### Email View
- **Email List**: Sender, subject, snippet, timestamp, read/unread status.
- **Email Content**: Full email display with sender info, subject, body, and action buttons.
- **Reply Area**: Text input for quick replies.
- **Resize Handle**: Vertical divider that can be dragged to resize the columns.

### Chat View
- **Conversation List**: Chat titles, last message preview, timestamp.
- **Chat Interface**: 
  - Message history with user and bot messages clearly distinguished
  - Input field for new messages
  - "New Chat" button to start a new conversation
- **Resize Handle**: Vertical divider that can be dragged to resize the columns.

### Notes View
- **Notes List**: Note titles, content snippets, timestamps.
- **Note Editor**: 
  - Title input
  - Content textarea
  - Save and Delete buttons
- **Resize Handle**: Vertical divider that can be dragged to resize the columns.

### Social View
- **Feed**: Posts with author, content, timestamp, and interaction buttons.
- **Interaction Buttons**: Like, comment, share, and bookmark.

## Component Architecture

The application follows a component-based architecture using React:

- **Dashboard**: Main component that orchestrates the entire application
- **Header**: Contains logo, location display, and menu
- **LeftSidebar**: Contains search, channel list, and create channel functionality
- **ChannelList**: Displays channels organized by collections
- **DraggableChannelItem**: Individual channel item with drag-and-drop capability
- **ContentArea**: Renders the appropriate view based on selected channel
- **Channel Views**: Specialized components for different channel types
  - EmailView
  - ChatView
  - NotesView
  - SocialView
- **Dialog Components**: Modal forms for adding new channels
- **Context Menus**: Right-click menus for channels and collections

## State Management

- **React State**: Used for component-level state
- **Props Drilling**: Used for passing data between components
- **Custom Hooks**: Used for reusable logic like media queries

## Additional Features

- **Resizable Panes**: All split views have resizable panes using drag handles.
- **Drag and Drop**: Channels can be reordered using drag and drop.
- **Context Menus**: Right-click menus for channels and collections.
- **Search Filtering**: Real-time filtering of channels based on search input.
- **Collection Management**: Create, rename, and delete collections.
- **Channel Highlighting**: Set custom highlight colors for channels.

## Logo and Branding

- **Logo**: The official Kamotion logo is a stylized "K" with a modern, minimalist design.
- **Typography**: "Inconsolata" monospace font is used throughout the application for a consistent, technical feel.
- **Color Scheme**: Primarily black and white with gray accents, allowing user content and collection colors to stand out.

This specification provides a comprehensive blueprint of the Kamotion.io UI implementation, ensuring a consistent and functional user experience across the platform.
