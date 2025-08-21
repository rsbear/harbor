# @harbor/command-types

Type definitions for Harbor's command system, enabling development of mini-apps with typed data stores and command handling.

## Overview

Harbor is a command-driven application platform that allows mini-apps to be mounted and interact with a unified command system. This package provides TypeScript definitions for building mini-apps that integrate seamlessly with Harbor's architecture.

## Installation

```bash
# Using Deno
import type { HarborCommand, MiniAppConfig } from "jsr:@harbor/command-types";

# Using npm/pnpm/yarn
npm install @harbor/command-types
pnpm add @harbor/command-types
yarn add @harbor/command-types
```

## Features

- 🎯 **Typed Command System**: Full TypeScript support for command parsing and handling
- 📦 **Data Store Management**: Built-in reactive data stores with Zod schema validation  
- 🔄 **State Management**: Message-based state system with loading, error, and success states
- 🚀 **Mini-App Architecture**: Clean API for building mountable applications
- 🛠️ **Developer Experience**: Comprehensive type definitions for better IDE support

## Quick Start

### Creating a Mini-App

```typescript
import type { HarborCommand, MiniAppConfig } from "@harbor/command-types";
import { z } from "zod";

// Define your data schema
const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean().default(false),
  createdAt: z.date().default(() => new Date())
});

const myMiniApp: MiniAppConfig = {
  name: "tasks",
  displayName: "Task Manager",
  description: "A simple task management mini-app",
  version: "1.0.0",
  mount: (command: HarborCommand) => {
    // Create a typed data store
    const taskStore = command.data.use(TaskSchema);
    
    // Handle command submissions
    command.input.onSubmit((miniName, query) => {
      if (miniName === "tasks") {
        handleTaskCommand(query, taskStore);
      }
    });
    
    // Load initial data
    taskStore.actions.list();
  }
};

function handleTaskCommand(query: string, taskStore: any) {
  const [action, ...args] = query.split(" ");
  
  switch (action) {
    case "add":
      const title = args.join(" ");
      taskStore.actions.update([crypto.randomUUID()], { title });
      break;
    case "list":
      taskStore.actions.list();
      break;
    case "toggle":
      const taskId = args[0];
      // Toggle task completion
      break;
  }
}
```

### Using the Command System

The command system parses input into two parts:
- `miniName`: The first part (identifies which mini-app should handle the command)
- `query`: Everything after the first space (the actual command/query)

```typescript
// Input: "tasks add Buy groceries"
// miniName: "tasks"
// query: "add Buy groceries"

command.input.miniName(); // "tasks"
command.input.query();    // "add Buy groceries"
```

## API Reference

### HarborCommand

The main interface injected into mini-apps:

```typescript
interface HarborCommand {
  input: CommandInput;
  data: CommandDataAPI;
}
```

### CommandInput

Handles command parsing and submission:

```typescript
interface CommandInput {
  miniName(): string;
  query(): string;
  onSubmit(handler?: (miniName: string, query: string) => void): void;
}
```

### DataStore

Reactive data store with full CRUD operations:

```typescript
interface DataStore<T> {
  msg: Msg<KvItem<T>>;
  actions: DataActions<T>;
}
```

### Message States

The data store uses a tagged union for state management:

```typescript
type Msg<T> =
  | { _tag: "None"; result: null }        // Initial state
  | { _tag: "Loading"; result: true }     // Loading data
  | { _tag: "Some"; result: T[] }         // List of items
  | { _tag: "Pick"; result: T }           // Single item selected
  | { _tag: "Err"; result: string }       // Error occurred
```

### Data Actions

Available operations for data manipulation:

```typescript
interface DataActions<T> {
  list(): Promise<T[] | undefined>;
  get(id: string[]): Promise<T | undefined>;
  update(id: string[], value: Partial<T>): Promise<T[] | undefined>;
  delete(id: string[]): Promise<T[] | undefined>;
  refresh(): Promise<T[] | undefined>;
  pick(id: string[]): Promise<T | undefined>;
  setMsgLoading(): Promise<void>;
}
```

## Examples

### Todo Mini-App

```typescript
import { z } from "zod";
import type { HarborCommand, MiniAppConfig } from "@harbor/command-types";

const TodoSchema = z.object({
  id: z.string(),
  text: z.string(),
  completed: z.boolean().default(false)
});

export const todoApp: MiniAppConfig = {
  name: "todo",
  mount: (command) => {
    const todos = command.data.use(TodoSchema);
    
    command.input.onSubmit((miniName, query) => {
      if (miniName !== "todo") return;
      
      const [action, ...args] = query.split(" ");
      
      switch (action) {
        case "add":
          todos.actions.update([crypto.randomUUID()], {
            text: args.join(" ")
          });
          break;
          
        case "complete":
          const id = args[0];
          todos.actions.update([id], { completed: true });
          break;
          
        case "list":
          todos.actions.list();
          break;
      }
    });
  }
};
```

### Notes Mini-App

```typescript
const NoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()).default([])
});

export const notesApp: MiniAppConfig = {
  name: "notes",
  mount: (command) => {
    const notes = command.data.use(NoteSchema);
    
    command.input.onSubmit((miniName, query) => {
      if (miniName !== "notes") return;
      
      // Parse commands like:
      // "notes create My Note Title"
      // "notes search javascript"
      // "notes tag note-id work urgent"
    });
  }
};
```

## Integration Frameworks

Harbor supports mounting mini-apps in various frameworks:

### React
```typescript
import { useEffect } from 'react';
import type { HarborCommand } from '@harbor/command-types';

function MyReactApp({ command }: { command: HarborCommand }) {
  useEffect(() => {
    // Initialize your app with the command system
  }, [command]);
}
```

### Svelte
```typescript
<script lang="ts">
  import type { HarborCommand } from '@harbor/command-types';
  export let command: HarborCommand;
  
  // Use the command system reactively
</script>
```

### Vue
```typescript
import type { HarborCommand } from '@harbor/command-types';

export default defineComponent({
  props: {
    command: Object as PropType<HarborCommand>
  },
  setup(props) {
    // Setup your Vue app with command integration
  }
});
```

## Contributing

This package is part of the Harbor ecosystem. For contributing guidelines and development setup, please see the main Harbor repository.

## License

MIT - See LICENSE file for details.