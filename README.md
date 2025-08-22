# Tauri + SvelteKit + TypeScript

# Harbor
Harbor is a tauri based host application for rendering mini local web apps. Think of the behavior as an intersection between command line applications and web technologies. As the host, it displays a singular text input, then parses the input to determine a mini app to render.

The text input is parsing strategy is to the first word of the input (delimited by a space) and the first word is used as a key to look up an application bundle to render.

TODO: document and implement the rest of the query string.

# Testing (WIP)


```bash
.
├── deno.json
├── deno.lock
├── design.ts
├── embedded-bundler
│   ├── bundler_test.ts
│   ├── bundler-aarch64-apple-darwin
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
│   ├── kv
│   │   ├── deno.json
│   │   ├── jsr.json
│   │   ├── mod.ts
│   │   └── okv.ts
│   └── PKGS_DOCS.md
├── README.md
├── scripts
│   └── build-jsr.ts
├── src
│   ├── app
│   │   ├── App.svelte
│   │   ├── app.svelte.test.js
│   │   └── test
│   ├── app.css
│   ├── app.html
│   ├── command-history
│   │   └── command-history.svelte
│   ├── lib
│   │   ├── cssjs.ts
│   │   └── MonacoContainer.svelte
│   ├── preferences
│   │   ├── preferences-kv.ts
│   │   ├── Preferences.md
│   │   └── Preferences.svelte
│   └── routes
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
│   │   ├── bundler.rs
│   │   ├── kv
│   │   │   ├── client.rs
│   │   │   ├── commands.rs
│   │   │   ├── mod.rs
│   │   │   └── types.rs
│   │   ├── lib.rs
│   │   └── main.rs
│   └── tauri.conf.json
├── svelte.config.ts
├── test-setup.ts
├── tsconfig.json
└── vite.config.js

19 directories, 54 files
```
