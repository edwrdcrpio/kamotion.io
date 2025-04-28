# Kamotion.io Implementation Plan (Revised - API Client Approach)

## Phase 1: Project Setup & Basic Structure

_(This phase remains largely the same as the previous plan)_

- [ ] **1.1: Initialize Next.js Project** (Create Next.js app, configure Tailwind)
- [ ] **1.2: Install Core Dependencies** (`shadcn/ui`, `firebase`, animation, etc.)
- [ ] **1.3: Set Up Basic Layout Components** (`Header`, `LeftSidebar`, `ContentArea` shells)
- [ ] **1.4: Run Development Server** (Verify basic layout)
- *Notes:* Ensure all necessary UI components from `shadcn/ui` are added.

## Phase 2: Firebase Auth & Configuration Storage Setup

This phase focuses on setting up Firebase Authentication and configuring Firestore *only* for storing user data, settings, and channel configurations (metadata, tokens).

- [ ] **2.1: Create Firebase Project & Enable Services**
    - [ ] Create Firebase project in [Firebase Console](https://console.firebase.google.com/).
    - [ ] Enable **Firebase Authentication** (choose sign-in methods like Email/Password, Google).
    - [ ] Enable **Firestore Database** (Native mode). Choose location.
    - *Guidance:* We need Firebase Auth for Kamotion user accounts and Firestore to store user-specific settings and the list of channels they've configured.
    - *Docs:* [Create Firebase Project](https://firebase.google.com/docs/web/setup#create-firebase-project), [Firestore Quickstart](https://firebase.google.com/docs/firestore/quickstart), [Auth Start](https://firebase.google.com/docs/auth/web/start)
    - *Notes:* Note your Firebase config details.

- [ ] **2.2: Install Firebase SDK** (`npm install firebase`)
    - *Guidance:* Allows the app to talk to Firebase services.
    - *Notes:*

- [ ] **2.3: Configure Firebase in Next.js**
    - [ ] Create `lib/firebaseConfig.ts` (or similar) with your Firebase project config keys.
    - [ ] Initialize Firebase app, export `auth` and `db` services.
    - *Guidance:* Connects the frontend to your Firebase backend. Use environment variables for keys in production.
    - *Docs:* [Initialize Firebase](https://firebase.google.com/docs/web/setup#initialize-firebase)
    - *Notes:*

- [ ] **2.4: Define Firestore Data Structures (Configuration Only)**
    - [ ] Plan Firestore collections for user settings and channel configurations.
    - *Example Structure:*
      ```
      /users/{userId}
        - email: string
        - displayName: string
        - createdAt: timestamp
        - settings: { layoutPrefs: map, ... }

      /channelConfigs/{configId}
        - userId: string (links config to user)
        - channelType: string ('gmail', 'google-drive', 'twitter', 'chat-gpt', 'outlook', etc.)
        - displayName: string (e.g., "Work Email", "My Notes", "Personal Twitter")
        - accountIdentifier: string (e.g., email address, username - for display)
        - collectionId: string (optional, for grouping)
        - credentials: map (e.g., { accessToken: string, refreshToken: string, expiry: timestamp } for OAuth) - **NEEDS SECURE HANDLING**
        - createdAt: timestamp
        - order: number (for sorting)
        - specificConfig: map (e.g., for LLM: { model: string, instructions: string })
      ```
    - *Guidance:* Firestore now stores *pointers* and *credentials* for external services, not the content itself. The `credentials` map is critical and sensitive.
    - *Docs:* [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
    - *Notes:* Carefully plan the `channelConfigs` structure to accommodate different service types and their required credentials/settings.

- [ ] **2.5: Set Firestore Security Rules (Focus on Config Data)**
    - [ ] Define Firestore rules ensuring users can only access/manage their own `users` document and their own `channelConfigs` documents.
    - *Guidance:* Protect user settings and sensitive credentials stored in Firestore.
    - *Docs:* [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
    - *Notes:* Example rule for `channelConfigs`: `match /channelConfigs/{configId} { allow read, write: if request.auth != null && request.auth.uid == resource.data.userId; }`

## Phase 3: Authentication (Kamotion User & Service OAuth)

Implement Kamotion user login and the mechanism to handle OAuth flows for connecting external services.

- [ ] **3.1: Implement Kamotion User Auth UI & Logic**
    - [ ] Create Login/Sign Up components/dialogs.
    - [ ] Implement Firebase Auth functions (`createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signOut`).
    - [ ] Implement `onAuthStateChanged` listener for session management (e.g., in an `AuthProvider` context).
    - *Guidance:* Standard Firebase user authentication for accessing Kamotion itself.
    - *Docs:* [Password Auth](https://firebase.google.com/docs/auth/web/password-auth), [Manage Users](https://firebase.google.com/docs/auth/web/manage-users)
    - *Notes:* Create the user document in `/users/{userId}` upon successful signup.

- [ ] **3.2: Set Up OAuth Client IDs/Secrets**
    - [ ] For *each* external service you want to integrate (Google Drive/Docs, Gmail, Outlook, Twitter, etc.), register your Kamotion application on their developer platform.
    - [ ] Obtain OAuth 2.0 Client ID and Client Secret for each service.
    - [ ] Configure authorized redirect URIs (these will point back to your Kamotion app).
    - *Guidance:* This is a prerequisite for initiating OAuth flows. Each service (Google, Microsoft, etc.) has its own developer console and process.
    - *Docs:* (Varies per provider) [Google API Console](https://console.developers.google.com/), [Microsoft Azure Portal](https://portal.azure.com/), [Twitter Developer Portal](https://developer.twitter.com/)
    - *Notes:* Store these Client IDs/Secrets securely, likely using backend environment variables or a secret manager. **Do not expose Client Secrets in the frontend.**

- [ ] **3.3: Implement Generic OAuth Flow Handler (Backend Recommended)**
    - [ ] Create backend logic (e.g., Next.js API Routes or Firebase Cloud Functions) to handle the OAuth 2.0 authorization code flow.
    - [ ] *Step 1 (Frontend):* When user clicks "Connect Gmail", redirect them to Google's OAuth consent screen URL (constructed using your Google Client ID and requested scopes).
    - [ ] *Step 2 (Backend):* User approves, Google redirects back to your specified redirect URI with an authorization `code`. Your backend handler receives this code.
    - [ ] *Step 3 (Backend):* Your backend exchanges the `code` (along with your Client ID and Secret) with Google's token endpoint to get `accessToken`, `refreshToken`, and `expiry`.
    - [ ] *Step 4 (Backend):* Securely store these tokens in the corresponding `channelConfigs` document in Firestore, linked to the `userId`.
    - *Guidance:* Handling the token exchange on the backend is crucial for keeping Client Secrets secure. This flow needs to be adapted for each OAuth provider (Google, Microsoft, etc.). The user signs in directly on the provider's official page during this process.
    - *Docs:* [OAuth 2.0 Web Server Apps (Google)](https://developers.google.com/identity/protocols/oauth2/web-server), [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers), [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
    - *Notes:* This is a complex but essential part of the new architecture. Consider libraries to help manage OAuth flows. Implement token refresh logic using `refreshToken`.

- [ ] **3.4: Secure Token Storage**
    - [ ] Evaluate secure methods for storing OAuth tokens in Firestore. Options:
        - Encrypt tokens before storing.
        - Integrate with GCP Secret Manager (requires more setup).
    - *Guidance:* Access tokens are sensitive credentials. Standard Firestore storage might not be sufficient without encryption or integration with a dedicated secrets service.
    - *Docs:* [GCP Secret Manager](https://cloud.google.com/secret-manager)
    - *Notes:* Prioritize security here.

## Phase 4: Core UI & Channel Configuration Management

Connect the UI to Firestore to manage the *list* and *configuration* of connected channels.

- [ ] **4.1: Fetch and Display Channel Configurations**
    - [ ] In `LeftSidebar`/`ChannelList`, fetch `channelConfigs` documents from Firestore for the logged-in user (`where('userId', '==', currentUser.uid)`).
    - [ ] Use `onSnapshot` for real-time updates when configurations are added/removed/updated.
    - [ ] Display the channels based on `displayName`, `channelType`, `accountIdentifier`. Group by `collectionId` if present.
    - *Guidance:* Populates the sidebar with the list of accounts the user has connected.
    - *Docs:* [Get Realtime Updates](https://firebase.google.com/docs/firestore/query-data/listen)
    - *Notes:* Handle loading and empty states.

- [ ] **4.2: Implement Channel Configuration Creation (Triggering OAuth)**
    - [ ] Connect "Add Channel" UI elements (dialogs like `AddInboxDialog`, `AddNoteDialog`, etc.)
    - [ ] When a user selects a service (e.g., "Add Inbox" -> "Gmail"), trigger the *frontend* part of the OAuth flow (redirect to provider's consent screen - Step 1 from 3.3).
    - [ ] The backend handler (from 3.3) will complete the flow and save the new `channelConfigs` document upon successful authorization.
    - *Guidance:* This links the UI action of adding a channel to the backend OAuth process.
    - *Notes:* The dialogs now primarily serve to initiate the connection process for a specific service type.

- [ ] **4.3: Implement Channel Selection & Content Area Routing**
    - [ ] Manage state for the currently selected `channelConfigs` document ID.
    - [ ] Update `ContentArea` to render the correct view (`EmailView`, `NotesView`, etc.) based on the selected `channelConfigs.channelType`.
    - [ ] Pass the *entire* selected `channelConfigs` object (including credentials, securely handled) or just the `configId` to the specific view component.
    - *Guidance:* Links sidebar selection to the main content area, preparing it to act as an API client for the selected service.
    - *Notes:*

- [ ] **4.4: Implement Collection Management (for Configurations)**
    - [ ] Allow creating/renaming/deleting collections (stored potentially in a separate `collections` collection or directly managed via `channelConfigs.collectionId`).
    - [ ] Implement adding `channelConfigs` to collections (updating the `collectionId` field in Firestore).
    - *Guidance:* Organizes the list of configured channels.
    - *Notes:*

- [ ] **4.5: Implement Channel Configuration Context Menu Actions**
    - [ ] Implement actions like "Delete Configuration" (removes the Firestore document, potentially needs to revoke OAuth token via API).
    - [ ] Implement "Move Up/Down" (updates `order` field in Firestore).
    - *Guidance:* Basic management for the list of connected accounts.
    - *Notes:* Revoking tokens upon deletion is good practice.

## Phase 5: Specific Channel View Implementation (API Clients)

Build each view to act as a client for the corresponding third-party API, using the stored credentials. **This is the most complex phase.**

- [ ] **5.1: Implement `NotesView` (Google Drive/Docs API Client)**
    - [ ] When selected, retrieve the Google OAuth tokens from the `channelConfigs` document.
    - [ ] Use the tokens to initialize the Google Drive/Docs API client (backend API route recommended for API calls).
    - [ ] *List Notes:* Call Drive API to list files (e.g., filter for Google Docs, maybe in a specific folder or with app properties).
    - [ ] *View/Edit Note:* Call Drive/Docs API to fetch document content. Render it (e.g., using a library or iframe). Saving requires calling the Docs API to update content.
    - [ ] *Create Note:* Call Drive API to create a new Google Doc file in the user's Drive.
    - *Guidance:* This view directly manipulates the user's Google Drive. All operations are API calls.
    - *Docs:* [Google Drive API](https://developers.google.com/drive/api/v3/about-sdk), [Google Docs API](https://developers.google.com/docs/api/overview)
    - *Notes:* Requires careful handling of API responses and errors. Decide how to represent the "note list".

- [ ] **5.2: Implement `ChatView` (LLM API Client)**
    - [ ] Retrieve LLM API key/config from the `channelConfigs` document.
    - [ ] Send user messages to a backend API route.
    - [ ] Backend route uses the API key to call the configured LLM API.
    - [ ] Stream response back to the frontend if possible.
    - *Guidance:* Similar to the previous plan, but emphasizes that chat history is *not* stored in Firestore unless explicitly implemented client-side or via API features. API key handling must be secure (backend).
    - *Notes:*

- [ ] **5.3: Implement `EmailView` (Gmail/Outlook API Client)**
    - [ ] Retrieve OAuth tokens for the selected email service (Gmail/Outlook) from `channelConfigs`.
    - [ ] Use tokens to initialize the respective API client (Gmail API / Microsoft Graph API) via backend routes.
    - [ ] *List Emails:* Call API to fetch email list/headers.
    - [ ] *View Email:* Call API to fetch full email content.
    - [ ] *Actions (Reply, Delete, etc.):* Call corresponding API functions.
    - *Guidance:* Acts as a full email client using the provider's APIs.
    - *Docs:* [Gmail API](https://developers.google.com/gmail/api/guides), [Microsoft Graph API (Mail)](https://docs.microsoft.com/en-us/graph/api/resources/mail-api-overview)
    - *Notes:* Requires handling pagination, different email formats, attachments, etc.

- [ ] **5.4: Implement `SocialView` (Platform API Client)**
    - [ ] Retrieve OAuth tokens for the selected social platform from `channelConfigs`.
    - [ ] Use tokens to initialize the platform's API client via backend routes.
    - [ ] *Fetch Feed:* Call API to get user's timeline/feed.
    - [ ] *Interactions (Like, Post, etc.):* Call corresponding API functions.
    - *Guidance:* Acts as a client for the specific social media platform.
    - *Docs:* Varies per platform (Twitter API, Facebook Graph API, etc.)
    - *Notes:* Subject to API rate limits and capabilities of each platform.

## Phase 6: UI Polish & Refinement

_(Largely the same as the previous plan, focusing on UX)_

- [ ] **6.1: Implement Resizable Panes**
- [ ] **6.2: Implement Drag and Drop Reordering (for Configurations)**
- [ ] **6.3: Refine Styling and Responsiveness**
- [ ] **6.4: Add Remaining UI Elements** (Notification dots might require background API checks or push notifications if supported by APIs)

## Phase 7: Security, Testing & Deployment

_(Emphasis on security and API testing)_

- [ ] **7.1: Security Review & Hardening**
    - [ ] Thoroughly review OAuth token handling (storage, usage, refresh, revocation).
    - [ ] Review Firestore security rules.
    - [ ] Implement robust error handling for all API interactions.
    - [ ] Secure backend API routes/functions.
- [ ] **7.2: Testing**
    - [ ] Manually test all OAuth flows.
    - [ ] Test all API interactions for each channel type (listing, viewing, actions).
    - [ ] Test token refresh scenarios.
    - [ ] Consider automated tests if feasible.
- [ ] **7.3: Deployment Preparation** (Secure environment variable setup is critical)
- [ ] **7.4: Deployment** (Vercel, Firebase Hosting, GCP Cloud Run, etc.)

---

This revised plan aligns with the goal of Kamotion being an API client aggregator. It significantly increases the reliance on backend logic (for OAuth and secure API calls) and secure credential management. Phase 5 becomes the most substantial part of the development effort.