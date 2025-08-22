<script lang="ts">
    import { onMount } from "svelte";
    import Monaco from "svelte-monaco";
    import z from "zod";
    import * as TOML from "smol-toml";
    import { invoke } from "@tauri-apps/api/core";
    import MonacoContainer from "$lib/MonacoContainer.svelte";
    import { prefsKv, type PrefsKvSchema } from "./preferences-kv.ts";
    import { input } from "@harbor/api/input";

    let err = $state("");
    let bundlingStatus: Record<string, string> = {}; // alias -> status text

    let value = $state("const x = 5");

    onMount(async () => {
        const saved = await prefsKv.get(["0"]);
        if (saved._tag === "Ok") {
            value = TOML.stringify(saved.result.value);
        }
        if (saved._tag === "None") {
            value = TOML.stringify({
                harbor: {
                    harbor_theme: "vs-dark",
                    monaco_theme: "vs-dark",
                    markdown_theme: "",
                },
                apps: [
                    {
                        alias: "ws",
                        github_url:
                            "https://github.com/rsbear/deleteme/mini-react-ts",
                    },
                    {
                        alias: "no",
                        github_url:
                            "https://github.com/rsbear/deleteme/mini-svelte-ts",
                    },
                ],
            });
        }
    });

    const savePrefs = async () => {
        try {
            const tomlToJson = TOML.parse(value) as PrefsKvSchema;
            const res = await prefsKv.set(["0"], tomlToJson);
            if (res._tag === "Error") {
                err = res.result;
                console.error("Error saving preferences:", res);
                return;
            }

            // After saving, start bundling apps sequentially
            for (const app of tomlToJson.apps) {
                bundlingStatus[app.alias] = `Bundling ${app.alias}...`;
                try {
                    const bundlePath = await invoke<string>(
                        "install_shipment",
                        {
                            githubUrl: app.github_url,
                            alias: app.alias,
                        },
                    );
                    bundlingStatus[app.alias] = `✅ Bundled at ${bundlePath}`;
                    await input.save(app.alias);
                } catch (e) {
                    console.error("Error bundling app:", app.alias, e);
                    bundlingStatus[app.alias] = `❌ Error bundling`;
                }
            }
        } catch (e) {
            console.error("Unexpected error saving preferences:", e);
            err = String(e);
        }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.metaKey && event.key === "s") {
            event.preventDefault();
            savePrefs();
        }
    };
</script>

<svelte:window onkeydown={handleKeyDown} />

<div>
    <h1>preferences</h1>

    <div>
        <button type="button" onclick={savePrefs}> Save Preferences </button>
    </div>

    <MonacoContainer>
        <Monaco
            options={{
                language: "toml",
                automaticLayout: false,
            }}
            theme="vs-dark"
            bind:value
        />
    </MonacoContainer>

    <!-- Show bundling status -->
    <div class="bundling-status">
        {#each Object.entries(bundlingStatus) as [alias, status]}
            <p><strong>{alias}:</strong> {status}</p>
        {/each}
    </div>
</div>

<style>
    .bundling-status {
        margin-top: 1rem;
        font-family: monospace;
        text-align: left;
    }
    .bundling-status p {
        margin: 0.25rem 0;
    }
</style>
