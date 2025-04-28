# Kamotion.io

<p align="center">
  <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Kamotion-Logo-v1-Xe2wqaIrHQ5oLBJ1VIkoUBK9cLiL61.png" alt="Kamotion.io Logo" width="100" height="100" />
</p>

## Overview

Kamotion.io is a unified communication dashboard that brings together multiple channels of digital communication into a single, cohesive interface. It allows users to manage emails, social media accounts, chat applications, work tools, and notes all in one place, streamlining workflow and improving productivity.

## Features

- **Unified Channel Management**: Manage multiple communication channels in one interface
- **Customizable Collections**: Group related channels into collections for better organization
- **Context Menus**: Right-click on channels for quick actions like moving, highlighting, or deleting
- **Drag and Drop**: Reorder channels within collections using intuitive drag and drop
- **Multiple View Types**:
  - **Email View**: Read and respond to emails with a resizable split view
  - **Chat View**: Engage with AI assistants and messaging platforms
  - **Social View**: Browse social media feeds and interact with posts
  - **Notes View**: Create and manage notes with a simple editor
- **Custom LLM Integration**: Connect to various AI models like ChatGPT, Grok, Claude, etc.
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Reusable UI components
- **Lucide Icons**: Beautiful, consistent icons
- **React Hooks**: For state management and side effects

## Installation

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Setup

1. Create a new Next.js project with TypeScript:

\`\`\`bash
npx create-next-app@latest kamotion-io --typescript
cd kamotion-io
\`\`\`

2. Install and configure Tailwind CSS:

\`\`\`bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
\`\`\`

3. Configure Tailwind CSS by updating `tailwind.config.js`:

\`\`\`bash
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
\`\`\`

4. Add Tailwind directives to your CSS in `app/globals.css`:

\`\`\`css
@tailwind base;
@tailwind components;
@tailwind utilities;
\`\`\`

5. Install shadcn/ui and its dependencies:

\`\`\`bash
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-checkbox @radix-ui/react-alert-dialog @radix-ui/react-separator class-variance-authority clsx tailwind-merge lucide-react
\`\`\`

6. Install tailwindcss-animate for animations:

\`\`\`bash
npm install tailwindcss-animate
\`\`\`

7. Update your `tailwind.config.js` to include the animation plugin:

\`\`\`bash
module.exports = {
  // ...existing config
  plugins: [require("tailwindcss-animate")],
}
\`\`\`

8. Add the shadcn/ui CLI for easier component installation:

\`\`\`bash
npm install -D @shadcn/ui
\`\`\`

9. Initialize shadcn/ui:

\`\`\`bash
npx shadcn init
\`\`\`

10. Install required shadcn/ui components:

\`\`\`bash
npx shadcn add button
npx shadcn add dialog
npx shadcn add dropdown-menu
npx shadcn add select
npx shadcn add input
npx shadcn add label
npx shadcn add checkbox
npx shadcn add alert-dialog
npx shadcn add separator
npx shadcn add card
npx shadcn add textarea
\`\`\`

11. Clone the repository (if you're not starting from scratch):

\`\`\`bash
git clone https://github.com/yourusername/kamotion-io.git
cd kamotion-io
\`\`\`

12. Install dependencies:

\`\`\`bash
npm install
# or
yarn install
\`\`\`

13. Run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

14. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

\`\`\`
kamotion-io/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout component
│   ├── page.tsx              # Home page component
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── channel-list.tsx      # Channel list component
│   ├── channel-views/        # Different channel view components
│   │   ├── chat-view.tsx     # Chat interface
│   │   ├── email-view.tsx    # Email interface
│   │   ├── notes-view.tsx    # Notes interface
│   │   └── social-view.tsx   # Social media interface
│   ├── dialogs/              # Dialog components
│   │   ├── add-inbox-dialog.tsx
│   │   ├── add-llm-dialog.tsx
│   │   ├── add-note-dialog.tsx
│   │   ├── add-social-dialog.tsx
│   │   ├── add-work-dialog.tsx
│   │   └── confirm-dialog.tsx
│   ├── ui/                   # shadcn/ui components
│   ├── channel-context-menu.tsx
│   ├── collection-context-menu.tsx
│   ├── content-area.tsx
│   ├── dashboard.tsx
│   ├── draggable-channel-item.tsx
│   ├── header.tsx
│   ├── left-sidebar.tsx
│   ├── logo.tsx
│   └── menu.tsx
├── hooks/                    # Custom React hooks
│   └── use-media-query.tsx
├── lib/                      # Utility functions
│   └── utils.ts
├── public/                   # Static assets
├── .eslintrc.json           # ESLint configuration
├── .gitignore               # Git ignore file
├── next.config.js           # Next.js configuration
├── package.json             # Project dependencies
├── README.md                # Project documentation
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
\`\`\`

## Component Structure

### Key Components

1. **Dashboard**: Main component that orchestrates the entire application
2. **LeftSidebar**: Contains the channel list and search functionality
3. **ChannelList**: Displays all channels organized by collections
4. **ContentArea**: Renders the appropriate view based on selected channel
5. **Channel Views**: Specialized components for different channel types
   - EmailView
   - ChatView
   - SocialView
   - NotesView
6. **Dialog Components**: Modal forms for adding new channels
7. **Context Menus**: Right-click menus for channels and collections

### Component Dependencies

\`\`\`
Dashboard
├── Header
│   └── Menu
│       ├── AddLLMDialog
│       ├── AddInboxDialog
│       ├── AddSocialDialog
│       ├── AddWorkDialog
│       └── AddNoteDialog
├── LeftSidebar
│   ├── ChannelList
│   │   ├── DraggableChannelItem
│   │   ├── ChannelContextMenu
│   │   └── CollectionContextMenu
│   └── CreateChannelDialog
└── ContentArea
    ├── EmailView
    ├── ChatView
    ├── SocialView
    └── NotesView
\`\`\`

## Usage

### Adding Channels

1. Click the "+" button in the sidebar or use the menu in the top-right corner
2. Select the type of channel you want to add (Inbox, Social, LLM, Work, Note)
3. Fill in the required information in the dialog
4. Click "Add" to create the new channel

### Managing Channels

- **Select a channel**: Click on any channel in the sidebar to view its content
- **Organize channels**: Right-click on a channel to access the context menu
  - Move channels up or down
  - Add to collections
  - Set highlight colors
  - Delete channels
- **Drag and drop**: Reorder channels by dragging them within their section

### Working with Collections

- **Create a collection**: Right-click on a channel and select "Add to Collection" > "Create New Collection"
- **Manage collections**: Right-click on a collection header to rename or delete it
- **Expand/collapse**: Click on a collection header to toggle its expanded state

## Configuration

### Custom LLMs

You can configure custom Large Language Models by providing:

- API Provider (OpenAI, Anthropic, Google AI, Mistral AI)
- API Key
- Model selection
- Custom instructions

### Email Integration

Configure email accounts with:

- Provider settings (Gmail, Outlook, Yahoo, Apple Mail)
- Server settings (IMAP/SMTP)
- Sync frequency
- Notification preferences

### Social Media Integration

Connect social accounts with:

- Platform selection
- Authentication
- Content type preferences
- Notification settings

## Customization

### Adding New Channel Types

To add a new channel type:

1. Create a new view component in `components/channel-views/`
2. Add a new dialog component in `components/dialogs/`
3. Update the `ContentArea` component to handle the new channel type
4. Add the new channel type to the menu options

### Styling

The project uses Tailwind CSS for styling. To customize the appearance:

1. Modify the theme in `tailwind.config.ts`
2. Add custom styles in `app/globals.css`
3. Use Tailwind utility classes in components

## Contributing

We welcome contributions to Kamotion.io! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please make sure your code follows our coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

---

© 2025 Kamotion.io. All rights reserved.
