Perfect — thanks for the clarifications 🙌. Let’s start with a **flow diagram** that captures the full lifecycle when the user saves preferences in `Preferences.svelte`.

---

## 🖼️ Flow Diagram: Preferences Save → Bundling → Runtime

```text
User clicks "Save Preferences"
        │
        ▼
Preferences.svelte
  - Saves TOML → KV
  - Iterates over `apps[]`
  - For each app (alias, github_url):
        │
        ▼
  Show "Bundling <alias>..." in UI
        │
        ▼
  invoke("install_shipment", { github_url })
        │
        ▼
Tauri Backend (Rust)
  ├─> Runs sidecar "bundler" with github_url
  │     (Deno script fetches repo, compiles, outputs JS bundle to stdout)
  │
  ├─> Receives bundle content
  │
  ├─> Saves to:
  │       app_data_dir/bundles/bundle-<alias>.js
  │
  └─> Returns bundle path string
        │
        ▼
Preferences.svelte
  - If success → mark alias as ✅ bundled
  - If error   → mark alias as ❌ error bundling (in memory only)
        │
        ▼
All apps processed sequentially
        │
        ▼
UI shows "All bundles built" (or errors inline)
        │
        ▼
Runtime Harbor
  - When user types `alias ...`
  - Harbor loads:
        app_data_dir/bundles/bundle-<alias>.js
  - Executes mini app
```

---

### 🔑 Key Design Decisions (based on your answers)
- **Bundle path convention**: always `bundle-<alias>.js` (not repo name).
- **Errors**: only tracked in memory (not persisted in KV).
- **Bundling order**: sequential (avoid race conditions).
- **UI feedback**: show `"Bundling <alias>..."` while each app is processed.

---

✅ Next step:
We’ll update the **Rust backend** (`install_shipment`) so it saves bundles as `bundle-<alias>.js` instead of `bundle-<repo>.js`.

Would you like me to go ahead and **rewrite the Rust `install_shipment` implementation** with this alias-based naming convention now?
