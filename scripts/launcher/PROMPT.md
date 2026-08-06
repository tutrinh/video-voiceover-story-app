# Desktop Launcher Prompt

A reusable prompt for giving any Vite + npm web app a double-clickable macOS
launcher, so it starts without opening a terminal.

Run it from the target project's directory. It produces two Desktop apps (start
and stop) plus a committed generator script that can rebuild them.

---

## The prompt

```
Create a desktop icon to launch this app without a terminal.

Build a macOS .app bundle that starts the dev server and opens the browser, plus
a companion app that stops it. Requirements:

- Generate them with a committed script (scripts/launcher/make-launcher.sh) that
  writes the apps to ~/Desktop by default, takes an optional destination arg, and
  bakes the absolute project path into the bundles. Keep the shell scripts and
  icon SVGs as separate template files with placeholder substitution, not heredocs.
- The launcher must resolve node/npm itself (Homebrew + nvm, including the newest
  ~/.nvm/versions/node/*/bin as a fallback) — Finder-launched apps don't inherit
  the shell PATH.
- Run npm install first if node_modules is missing, then start `npm run dev`
  detached with nohup, poll the dev server URL until it answers, then open it.
  Bail out early with an error if the dev process dies.
- If the server is already running, just reopen the browser. Kill stale listeners
  on the dev ports before a cold start.
- Log startup output to .launcher/launcher.log (append, don't truncate while the
  running server still holds the file open). On failure show an osascript dialog
  with a "Show Log" button that opens the log in Console.
- Set LSUIElement so the launchers don't leave a dock icon, and ad-hoc codesign
  the bundles.
- Give each app a custom icon: an SVG in the repo rendered to a multi-resolution
  .icns via iconutil, using rsvg-convert / magick / cairosvg — whichever exists —
  and skip the icon gracefully if none do.
- Add .launcher/ to .gitignore and document the launcher in the README.

Read the project's vite config and package.json to get the real dev ports and
scripts. Test it end to end: cold start, relaunch while running, and stop.
```

---

## Adjust per project

| Situation | Change |
|---|---|
| Plain Vite app, no backend | Only one port (5173) is involved. The prompt says to read the config, but check that no phantom backend port was copied in. |
| yarn / pnpm / bun | State it in the prompt — the `npm install` and `npm run dev` lines are the only parts that change. |
| Non-default port | The prompt covers this, but confirm the port in the generated `launch.sh` matches the vite config. |
| Install to /Applications | Run the generated script with a destination: `./scripts/launcher/make-launcher.sh /Applications` |

## Why these requirements matter

- **PATH resolution** is the failure that bites first. Apps opened from Finder go
  through LaunchServices and get launchd's minimal environment, so a normal
  `npm run dev` line silently fails for anyone using nvm.
- **Detached start plus a readiness poll** is what lets the launcher exit
  immediately while the servers keep running, and guarantees the browser doesn't
  open before Vite is ready to answer.
- **Append-only logging** matters because the running dev server holds the log
  file open; truncating it on relaunch throws away the output you need when
  something breaks.
- **LSUIElement** keeps a shell-script bundle from parking a dead icon in the
  dock, since it can't respond to a Quit event anyway.

## Faster alternative

If the new project is similar, skip the prompt: copy an existing
`scripts/launcher/` directory over, edit the port variables and app names at the
top of `launch.sh` and `stop.sh`, and run `./scripts/launcher/make-launcher.sh`.
Everything else is project-agnostic.

## Reference implementation

`video-voiceover-story-app/scripts/launcher/` — Vite on 5173 with an Express
backend on 3001, started together through `concurrently`.
