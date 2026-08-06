#!/bin/bash
# Stops the dev servers started by the Voiceover Story Studio launcher.

PROJECT_DIR="__PROJECT_DIR__"
APP_NAME="__APP_NAME__"
FRONTEND_PORT=5173
BACKEND_PORT=3001
PID_FILE="${PROJECT_DIR}/.launcher/dev-server.pid"

stopped=0

if [ -f "$PID_FILE" ]; then
  pid="$(cat "$PID_FILE" 2>/dev/null)"
  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
    # Kill the process group so vite and express go down with concurrently.
    kill -TERM -"$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null
    stopped=1
  fi
  rm -f "$PID_FILE"
fi

for port in "$FRONTEND_PORT" "$BACKEND_PORT"; do
  pids="$(/usr/sbin/lsof -ti "tcp:${port}" -sTCP:LISTEN 2>/dev/null)"
  if [ -n "$pids" ]; then
    echo "$pids" | xargs kill 2>/dev/null
    stopped=1
  fi
done

sleep 1

# Anything still holding a port gets a hard kill.
for port in "$FRONTEND_PORT" "$BACKEND_PORT"; do
  pids="$(/usr/sbin/lsof -ti "tcp:${port}" -sTCP:LISTEN 2>/dev/null)"
  [ -n "$pids" ] && echo "$pids" | xargs kill -9 2>/dev/null
done

if [ "$stopped" -eq 1 ]; then
  /usr/bin/osascript -e "display notification \"Servers stopped.\" with title \"${APP_NAME}\"" >/dev/null 2>&1
else
  /usr/bin/osascript -e "display notification \"Nothing was running.\" with title \"${APP_NAME}\"" >/dev/null 2>&1
fi
