<script lang="ts">
    import { mode } from "@harbor/api/mode";
</script>

<aside class="shrink text-xs flex items-center gap-1">
    <p>{mode.current()}</p>
</aside>
