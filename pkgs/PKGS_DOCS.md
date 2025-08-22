Got it ✅ — let’s make a **short internal doc** for your team that explains how to use `@harbor/api` and `@harbor/kv` inside the host app, and how they wire into the **main input** (the Spotlight‑style command bar).

---

# 🛠 Harbor Internal Usage Guide

## Packages

- **`@harbor/kv`**
  A typed key‑value store abstraction (backed by Tauri commands).
  Provides `okvTable` for CRUD operations with Zod validation.

- **`@harbor/api`**
  The shared API surface for host + mini apps.
  Provides:
  - `harbor.input` → global input state (miniName, query, submit)
  - `harbor.mini.use(schema)` → per‑mini‑app data access + reactive `msg` state

---

## 1. Wiring the Host Input

The **host app** owns the single input field.
You must connect it to `harbor.input` so that mini apps can react to it.

Example (Svelte):

```svelte
<script lang="ts">
  import { harbor } from "@harbor/api";

  function handleSubmit(event: Event) {
    event.preventDefault();
    harbor.input.submit(); // triggers onSubmit handlers
  }
</script>

<form on:submit={handleSubmit}>
  <input
    type="text"
    placeholder="Enter a command..."
    bind:value={$harbor.input.val} <!-- if using Svelte store wrapper -->
  />
</form>
```

If not using Svelte’s `$store` sugar, you can wire manually:

```ts
function handleInput(e: Event) {
  harbor.input.setValue((e.target as HTMLInputElement).value);
}
```

---

## 2. Accessing Input State

Anywhere in the host or a mini app:

```ts
import { harbor } from "@harbor/api";

harbor.input.miniName.subscribe((name) => {
  console.log("Current alias:", name);
});

harbor.input.query.subscribe((q) => {
  console.log("Current query:", q);
});
```

- `miniName` = first token of input (e.g. `"prefs"` in `"prefs darkmode"`)
- `query` = everything after the alias

---

## 3. Mini App Data

Mini apps declare their schema and get a typed KV table + reactive state:

```ts
import { harbor } from "@harbor/api";
import { z } from "jsr:zod";

const schema = z.object({
  command: z.string(),
  count: z.number(),
});

const mini = harbor.mini.use(schema);

// CRUD
await mini.kv.set(["foo"], { command: "prefs", count: 1 });
const item = await mini.kv.get(["foo"]);
const list = await mini.kv.list();

// Reactive state
mini.msg.subscribe((m) => {
  if (m._tag === "Some") {
    console.log("Got items:", m.result);
  }
});
```

---

## 4. How It All Connects

- The **host input** updates `harbor.input.val`.
- `harbor.input` automatically derives:
  - `miniName` (alias)
  - `query` (rest of input)
- Mini apps use `harbor.mini.use(schema)` to bind to their own KV table.
- Mini apps can react to `harbor.input.miniName` and `harbor.input.query` to decide when to render.
- `mini.msg` is the reactive state machine for data loading (`None`, `Loading`, `Some`, `Pick`, `Err`).

---

## 5. Example: Preferences Mini App

```svelte
<script lang="ts">
  import { harbor } from "@harbor/api";
  import { z } from "jsr:zod";

  const prefsSchema = z.object({
    theme: z.string(),
  });

  const prefs = harbor.mini.use(prefsSchema);

  $: harbor.input.miniName.subscribe((name) => {
    if (name === "prefs") {
      prefs.kv.list(); // load preferences when alias is active
    }
  });
</script>

{#if $harbor.input.miniName === "prefs"}
  <div>
    <h2>Preferences</h2>
    {#if $prefs.msg._tag === "Some"}
      <pre>{JSON.stringify($prefs.msg.result, null, 2)}</pre>
    {/if}
  </div>
{/if}
```

---

## 6. Publishing Mini Apps

- Mini apps should **only depend on `@harbor/api`**.
- They should never touch the host input directly.
- The host app provides the input → `harbor.input` → mini apps consume it.

---

# ✅ TL;DR

- Host app wires `<input>` → `harbor.input.setValue()` + `harbor.input.submit()`.
- Mini apps use `harbor.input.miniName` + `harbor.input.query` to know when to activate.
- Mini apps use `harbor.mini.use(schema)` for their own KV + reactive state.
- `@harbor/kv` is the low‑level KV layer, `@harbor/api` is the high‑level shared API.
