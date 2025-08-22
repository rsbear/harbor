<!-- main app -->

<script lang="ts">
    import "../app.css";
    import { onMount } from "svelte";
    import { prefsKv } from "../preferences/preferences-kv";
    import Preferences from "../preferences/Preferences.svelte";
    import { harbor } from "@harbor/api";
    import { homeDir, join } from "@tauri-apps/api/path";
    import { readTextFile } from "@tauri-apps/plugin-fs";
    import { commandContainer, fullWidthHR } from "$lib/cssjs";
    import CommandHistory from "../command-history/command-history.svelte";

    let cmd = $state("");
    let appAliasesInPrefs = $state<string[]>([]);

    onMount(async () => {
        const prefs = await prefsKv.get(["0"]);
        if (prefs._tag === "Ok") {
            appAliasesInPrefs = prefs.result.value.apps.map((x) => x.alias);
        } else {
            console.error("Error fetching app aliases:", prefs);
        }
    });

    function onChange(event: Event) {
        const input = event.target as HTMLInputElement;
        harbor.input.inputValue.set(input.value);
    }

    async function handleSubmit(event: Event) {
        event.preventDefault();
        const miniName = harbor.input.miniName.get();
        cmd = miniName;

        if (appAliasesInPrefs.includes(miniName)) {
            await launchPrebundledApp(miniName);
        }
    }
    type LoadedModule = {
        harborMount?: (el: HTMLElement) => void;
        unmount?: () => void;
    };

    const loadedModules = new Map<string, LoadedModule>();

    async function launchPrebundledApp(alias: string) {
        const slot = document.getElementById("shipment-slot");
        if (!slot) return;

        // Clear previous app
        slot.innerHTML = "";

        try {
            const home = await homeDir();
            const bundlePath = await join(
                home,
                ".harbor",
                "bundles",
                `bundle-${alias}.js`,
            );

            // Read bundle and create a Blob URL
            const bundleContent = await readTextFile(bundlePath);
            const blob = new Blob([bundleContent], {
                type: "application/javascript",
            });
            const blobUrl = URL.createObjectURL(blob);

            // Dynamically import the module
            const mod: LoadedModule = await import(blobUrl);

            if (mod.harborMount && typeof mod.harborMount === "function") {
                loadedModules.set(alias, mod);
                console.log(`✅ Successfully loaded module for '${alias}'`);

                // Call its mount function, passing the slot
                mod.harborMount(slot);
            } else {
                console.warn(
                    `Module '${alias}' err: missing 'harborMount' fn.`,
                );
                slot.innerHTML = `<p style="color:red">Invalid module: no mount()</p>`;
            }

            // Optional: revoke URL after import (safe if you don’t need re-import)
            URL.revokeObjectURL(blobUrl);
        } catch (e) {
            console.error(`❌ Failed to load bundle for ${alias}`, e);
            slot.innerHTML = `<p style="color:red">Error loading ${alias}</p>`;
        }
    }
</script>

<main class="flex flex-col min-h-[100dvh]">
    <div class="flex-1">
        {#if cmd === "prefs" || cmd === "preferences"}
            <Preferences />
        {/if}
        {#each appAliasesInPrefs as alias}
            {#if cmd === alias}
                <p>Launching {alias}...</p>
                <div id="shipment-slot" class="shipment-slot"></div>
                <!-- {@html harbor.launchApp(alias)} -->
            {/if}
        {/each}
    </div>

    <CommandHistory />
    <div class={fullWidthHR()}></div>

    <div class={commandContainer()}>
        <form id="harbor-command" class="flex-1 w-full" onsubmit={handleSubmit}>
            <input
                id="harbor-input"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                placeholder="Enter a command..."
                bind:value={cmd}
                onchange={onChange}
            />
            <button type="submit" class="hidden">Submit</button>
        </form>
        <aside class="shrink text-xs">
            <p>Hints</p>
        </aside>
    </div>
</main>

<style>
    :root {
        font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
        font-size: 16px;
        line-height: 24px;
        font-weight: 400;

        color: #0f0f0f;
        background-color: #f6f6f6;

        font-synthesis: none;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        -webkit-text-size-adjust: 100%;
    }

    input {
        width: 100%;
    }

    input,
    button {
        border-radius: 8px;
        border: 1px solid transparent;
        padding: 0.6em 1.2em;
        font-size: 1em;
        font-weight: 500;
        font-family: inherit;
        color: white;
        background-color: transparent;
        transition: border-color 0.25s;
        box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
    }

    button {
        cursor: pointer;
    }

    button:hover {
        border-color: #396cd8;
    }
    button:active {
        border-color: #396cd8;
        background-color: #e8e8e8;
    }

    input,
    button {
        outline: none;
    }

    @media (prefers-color-scheme: dark) {
        :root {
            color: #f6f6f6;
            background-color: #2f2f2f;
        }
    }
</style>
