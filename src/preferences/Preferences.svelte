<script lang="ts">
    import Monaco from "svelte-monaco";
    import z from "zod";
    import { onMount } from "svelte";
    import MonacoContainer from "$lib/MonacoContainer.svelte";
    import * as TOML from "smol-toml";
    import { okvTable } from "@harbor/kv";

    const prefsSchema = z.object({
        harbor: z.object({
            harbor_theme: z.string(),
            monaco_theme: z.string().optional(),
            markdown_theme: z.string().optional(),
        }),
        apps: z.array(z.object({ alias: z.string(), github_url: z.url() })),
    });

    let err = $state("");

    const kv = okvTable("Preferences", prefsSchema);

    // this is fully reactive! setting value to another string will change the editor accordingly
    let value = "const x = 5";

    onMount(async () => {
        const saved = await kv.get(["0"]);
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
        const tomlToJson = TOML.parse(value) as z.infer<typeof prefsSchema>;
        const res = await kv.set(["0"], tomlToJson);
        if (res._tag === "Error") {
            err = res.result;
            console.error("Error saving preferences:", res);
            return;
        }
        console.log("saved res", res);
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

    <div class="">
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
</div>
