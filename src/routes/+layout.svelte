<script lang="ts">
    import { newCommandInternal } from "../command/CommandInternal.svelte";
    let { children } = $props();

    newCommandInternal();
</script>

{@render children()}
