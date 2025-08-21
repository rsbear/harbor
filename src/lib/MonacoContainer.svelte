<script lang="ts">
    let { children } = $props();
</script>

<div id="playground">
    <div id="editor">
        {@render children()}
    </div>
</div>

<style>
    div#editor {
        width: 100%;
        margin-right: 2rem;
        height: 100%;
        border: 1px solid black;
    }

    #playground {
        height: 60vh;
        width: 100%;
        display: flex;
    }
</style>
