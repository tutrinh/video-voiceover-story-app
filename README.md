# Video Voiceover Story App

An AI-assisted writing, teleprompter, and voice-recording studio for short-form video creators. The app helps turn a topic into a structured Instagram Reel script, rehearse it on an adjustable teleprompter, record multiple voiceover takes, and export production-ready text and captions.

## Features

- Generate topic-specific short-form scripts with timed story beats.
- Choose between two storytelling frameworks:
  - Hook → Beginning → Middle → Resolution → CTA
  - Hook → Problem → Journey → Solution → CTA
- Generate with Codex CLI using an eligible ChatGPT sign-in.
- Optionally generate with Claude CLI.
- Continue working with the built-in local fallback if a CLI is unavailable or returns invalid output.
- Adjust teleprompter speed, font size, and active story beat.
- Record, pause, replay, and download multiple voiceover takes in the browser.
- Export scripts as `.txt` files and timed captions as `.srt` files.
- Practice spontaneous delivery with a countdown-based prompt trainer.
- Browse and search the bundled and browser-stored story library.

## Tech stack

- React 19 and TypeScript
- Vite 6
- Tailwind CSS 4
- Express 4
- IndexedDB through `idb-keyval`
- Browser MediaRecorder and Web Audio APIs
- Codex CLI and Claude CLI integrations

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer
- npm
- A modern browser with microphone and MediaRecorder support
- Optional: [Codex CLI](https://learn.chatgpt.com/docs/codex/cli) for ChatGPT-backed generation
- Optional: Claude CLI for Claude-backed generation

The app does not require an OpenAI API key when using Codex CLI with an eligible ChatGPT account. Codex availability and usage limits depend on the signed-in account and subscription.

## Installation

Clone the repository and install its dependencies:

```bash
git clone https://github.com/tutrinh/video-voiceover-story-app.git
cd video-voiceover-story-app
npm install
```

### Set up Codex CLI

Install Codex using the current instructions in the [official Codex CLI guide](https://learn.chatgpt.com/docs/codex/cli). On macOS or Linux, the standalone installer is:

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | sh
```

Run Codex once and select **Sign in with ChatGPT**:

```bash
codex
```

Confirm the command is available:

```bash
codex --version
```

The application calls `codex exec` without forcing a model ID. Codex therefore uses the model currently configured and available to the signed-in account.

## Development

Start the Vite frontend and Express backend together:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The frontend proxies `/api` requests to the backend at `http://localhost:3001`.

Other commands:

```bash
npm run dev:frontend  # Start only the Vite frontend
npm run server        # Start only the Express backend
npm run build         # Type-check and create a production build
npm run preview       # Preview the production frontend build
```

For AI generation during development, use `npm run dev` so both the frontend and backend are running.

## How to use

### 1. Generate a script

1. Open **Script Generator**.
2. Choose a storytelling framework.
3. Select **Codex CLI**, **Claude CLI**, or the browser fallback engine.
4. Enter or generate a topic.
5. Choose the audience, tone, and target duration.
6. Review or customize the full generation prompt.
7. Select **Generate Script**.

When Codex is selected, model selection is managed by the Codex CLI. The app sends the prompt to the locally installed `codex` command and reads the returned JSON script.

### 2. Rehearse and record

After generation, the script opens in **Teleprompter Studio**.

1. Allow microphone access when prompted.
2. Adjust the teleprompter speed and text size.
3. Start the teleprompter and move through the story beats.
4. Record one or more voiceover takes.
5. Replay takes at different playback speeds.
6. Download a selected recording as a `.webm` file.

### 3. Export the script

From Teleprompter Studio, use:

- **Download .SRT Captions** for timed subtitle cues.
- **Export TXT Script** for a readable production script.
- **Download Audio** for the active recorded take.

### 4. Practice without generating

Open **On-the-Spot Practice**, choose the practice settings, and start the countdown. The generated practice prompt opens directly in the teleprompter.

### 5. Browse stories

Open **Saved Stories** to search the bundled script database and browser-stored stories. Browser data is stored locally in IndexedDB and is specific to the browser profile and site origin.

## AI generation behavior

The Express server exposes two endpoints:

- `GET /api/health` checks whether the local `codex` and `claude` commands are available.
- `POST /api/generate` builds the script prompt, invokes the selected CLI, and validates the returned JSON.

For Codex, the backend runs the equivalent of:

```bash
codex exec --skip-git-repo-check -
```

The prompt is written to standard input. No model flag is passed, allowing Codex to use its configured default.

If the selected CLI is missing, authentication fails, or the output is not valid script JSON, the backend returns a topic-aware local fallback script so the rest of the studio remains usable.

## Project structure

```text
.
├── server.js                 # Express API and CLI integrations
├── src/
│   ├── components/           # Generator, teleprompter, practice, and library UI
│   ├── db/                   # Bundled story database
│   ├── types/                # Shared TypeScript types
│   └── utils/                # IndexedDB, topic seeding, and export helpers
├── vite.config.ts            # Vite plugins, port, and API proxy
└── package.json              # Dependencies and project scripts
```

## Troubleshooting

### Codex shows as unavailable

Run the following in the same shell environment used to start the app:

```bash
which codex
codex --version
```

If Codex is installed but not authenticated, run `codex` and complete **Sign in with ChatGPT**, then restart `npm run dev`.

### Generation uses the fallback engine

Check the backend terminal for a CLI warning. Common causes include:

- The selected CLI is not installed or is not on `PATH`.
- The CLI is not authenticated.
- The signed-in account has reached a usage limit.
- The CLI returned text that could not be parsed as the expected JSON structure.

### Microphone recording does not work

- Allow microphone access for `localhost` in the browser.
- Use a current version of Chrome, Edge, Firefox, or Safari.
- Close other applications that may have exclusive control of the microphone.
- Reload the page after changing browser permissions.

### Browser-stored stories disappeared

IndexedDB data can be removed when site data is cleared, private browsing ends, or the app is opened under a different origin or port. Download important scripts and recordings before clearing browser storage.
