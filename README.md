# Tauri + SvelteKit + TypeScript

# Harbor
Harbor is a tauri based host application for rendering mini local web apps. Think of the behavior as an intersection between command line applications and web technologies. As the host, it displays a singular text input, then parses the input to determine a mini app to render.

The text input is parsing strategy is to the first word of the input (delimited by a space) and the first word is used as a key to look up an application bundle to render.

TODO: document and implement the rest of the query string.

```bash
.
├── deno.json
├── deno.lock
├── design.ts
├── embedded-bundler
│   ├── bundler_test.ts
│   ├── bundler.ts
│   ├── deno.json
│   ├── deno.lock
│   └── test_embedded_bundler.ts
├── pkgs
│   ├── api
│   │   ├── command-data.ts
│   │   ├── deno.json
│   │   ├── input.ts
│   │   ├── jsr.json
│   │   ├── mod.ts
│   │   └── store.ts
│   └── kv
│       ├── deno.json
│       ├── jsr.json
│       ├── mod.ts
│       └── okv.ts
├── PKGS_DOCS.md
├── README.md
├── scripts
│   └── build-jsr.ts
├── src
│   ├── app.html
│   ├── kv
│   │   └── mod.ts
│   ├── lib
│   │   └── MonacoContainer.svelte
│   ├── preferences
│   │   └── Preferences.svelte
│   └── routes
│       ├── +layout.svelte
│       ├── +layout.ts
│       └── +page.svelte
├── src-tauri
│   ├── build.rs
│   ├── capabilities
│   │   └── default.json
│   ├── Cargo.lock
│   ├── Cargo.toml
│   ├── gen
│   │   └── schemas
│   │       ├── acl-manifests.json
│   │       ├── capabilities.json
│   │       ├── desktop-schema.json
│   │       └── macOS-schema.json
│   ├── src
│   │   ├── kv
│   │   │   ├── client.rs
│   │   │   ├── commands.rs
│   │   │   ├── mod.rs
│   │   │   └── types.rs
│   │   ├── lib.rs
│   │   └── main.rs
│   └── tauri.conf.json
├── svelte.config.js
├── types
│   └── harbor-command.d.ts
└── vite.config.js

18 directories, 48 files
```
