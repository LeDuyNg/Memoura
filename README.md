<p align="center">
  <img src="./memoura-banner.svg" alt="memoura logo" width="100%" />
</p>

# Memoura

A student-first note-taking and productivity app. Organize your notes, sync with Canvas courses, and plan your week—all in one desktop app.

Built with **Electron + React + Vite**

---

## Features

- **Note Editor** — Create and edit notes in a clean, distraction-free interface
- **Markdown Support** — Write in Markdown with live preview for `.md` files
- **Organized Notes** — Browse and manage your note vault with a sidebar
- **Canvas Integration** — View your Canvas courses and assignments in a built-in calendar
- **Auto-save** — Changes are automatically saved as you edit
- **Dark Theme** — Eye friendly dark interface because everyone knows college students use their devices too much

---

## Requirements

To run Memoura locally, you WILL NEED:
- [Node.js](https://nodejs.org/) (v16+) — comes with `npm`
- [Git](https://git-scm.com/)
- A Canvas API key 

**Supported Platforms:** macOS, Windows, Linux

---

## Setup & Development

### 1. Clone the Repository
```bash
git clone https://github.com/LeDuyNg/Memoura.git
cd Memoura
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment (NECESSARY STEP DO NOT SKIP)
Create a `.env` file in the project root to enable Canvas integration:

In order to get your API key from canvas you need to go to your canvas settings by clicking on your "account" icon in the sidebar. Then select settings and scroll down until you see a blue button that says "New Access Token." Create one and you will be given an API key as a result.  

```
CANVAS_API_KEY="your_api_key_here"
CANVAS_DOMAIN="https://sjsu.instructure.com"
```

### 4. Run Development Server
```bash
npm run dev
```
The app will open in an Electron window. Changes to source files will hot-reload.

---

## Building

This will be necessary if we ever acutally wish to ship this project out to other users:

```bash
# Build for macOS
npm run build:mac

# Build for Windows
npm run build:win

# Build for Linux
npm run build:linux
```

Built files will be in the `dist/` directory.

---

## Project Structure

```
src/
├── main/           # Electron main process (file I/O, IPC)
├── preload/        # Preload scripts (secure IPC)
└── renderer/       # React app (UI components)
    └── src/
        ├── components/
        │   ├── Dashboard.jsx    # Main view, file browser
        │   ├── Notepad.jsx      # Editor with Markdown preview
        │   ├── Calendar.jsx     # Canvas courses calendar
        │   └── Sidebar.jsx      # Navigation
        └── assets/
            └── main.css         # Global styles
```

---

## Commands that might be useful

- `npm run dev` — Start development server
- `npm run build` — Build the app
- `npm run preview` — Preview the built app
- `npm run lint` — Run ESLint
- `npm run format` — Format code with Prettier
