# LLM Overview & Usage

This document provides a high-level overview of how **flows** work in the
application, along with some simple usage examples.

---

## What Are Flows?

A **flow** is a sequence of steps that the app executes in response to user
commands. Think of it as a pipeline:

1. **Input** → User types a command into the input field.
2. **Parsing** → The command is parsed and matched against known aliases or
   preferences.
3. **Dispatch** → The app decides what to do:
   - Launch a pre-bundled app
   - Open preferences
   - Show command history
   - Or fall back to hints
4. **Execution** → The chosen module (or UI component) is mounted into the
   `shipment-slot` container.
5. **Feedback** → The user sees results, logs, or errors.

---

## Core Components

- **`App.svelte`**
  The main entry point. Handles command input, dispatching, and rendering.

- **`Preferences.svelte`**
  UI for managing user preferences and app aliases.

- **`CommandHistory.svelte`**
  Displays a list of previously executed commands.

- **`Hints.svelte`**
  Provides contextual hints for available commands.

- **Pre-bundled Apps**
  Dynamically loaded JavaScript bundles stored in `~/.harbor/bundles/`.

---

## Usage

### Running a Command
1. Type a command into the input field (bottom of the screen).
2. Press **Enter**.
3. If the command matches:
   - `prefs` or `preferences` → Opens the Preferences UI.
   - An app alias (e.g. `notes`) → Launches the corresponding pre-bundled app.
   - Otherwise → Shows hints.

### Viewing Command History
- The **Command History** panel shows a list of past commands with timestamps.
- Useful for re-running or debugging commands.

### Adding a New App Alias
1. Open **Preferences** (`prefs`).
2. Add a new app alias and configure its bundle.
3. Save preferences.
4. Relaunch the app and use the alias as a command.

---

## 🧪 Testing

We use **Vitest** + **@testing-library/svelte** for component testing.

Example test (`App.test.js`):

```js
import { render, screen } from "@testing-library/svelte";
import { expect, test } from "vitest";
import App from "./App.svelte";

test("renders the command input field", () => {
  render(App);
  const input = screen.getByPlaceholderText("Enter a command...");
  expect(input).toBeInTheDocument();
});
```

Run tests with:

```bash
npm run test
```

---

## Summary

- **Flows** = Input → Parse → Dispatch → Execute → Feedback
- Commands can launch apps, open preferences, or show history.
- Pre-bundled apps are dynamically loaded from the filesystem.
- Testing ensures the UI and flows behave as expected.
