<script lang="ts">
    import { onMount } from "svelte";
    import Preferences from "../../preferences/Preferences.svelte";
    import { prefsKv } from "../../preferences/preferences-kv";

    let appAliasesInPrefs = $state<string[]>([]);

    let { cmd } = $props();

    onMount(async () => {
        const prefs = await prefsKv.get(["0"]);
        if (prefs._tag === "Ok") {
            appAliasesInPrefs = prefs.result.value.apps.map((x) => x.alias);
        } else {
            console.error("Error fetching app aliases:", prefs);
        }
    });
</script>

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
