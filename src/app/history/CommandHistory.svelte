<script lang="ts">
    import { input } from "@harbor/api/input";
    import { onMount } from "svelte";

    type Records = Awaited<ReturnType<typeof input.history>>;
    let records = $state<Records>({
        _tag: "None",
        result: null,
    });

    onMount(async () => {
        const data = await input.history();
        records = data;
    });
</script>

<div class="w-full">
    <p>command history: {records._tag}</p>
    {#if records._tag === "Ok"}
        <ul>
            {#each records.result as record}
                <li>{record.value.command} - {record.metadata.updated_at}</li>
            {/each}
        </ul>
    {:else if records._tag === "Error"}
        <p>Error: {records.result}</p>
    {:else}
        <p>No command history available.</p>
    {/if}
</div>
