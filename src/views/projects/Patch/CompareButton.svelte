<script lang="ts">
  import Button from "@app/components/Button.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";

  export let fromCommit: string;
  export let toCommit: string;
</script>

<Button size="regular" disabled>
  <span style:color="var(--color-foreground-contrast)">Compare</span>
  <span
    style:color="var(--color-fill-secondary)"
    style:font-family="var(--font-family-monospace)">
    {fromCommit.substring(0, 6)}..{toCommit.substring(0, 6)}
  </span>
  <IconSmall name={"chevron-down"} />
</Button>
