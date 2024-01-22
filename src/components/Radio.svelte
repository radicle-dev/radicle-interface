<script lang="ts">
  export let ariaLabel: string | undefined = undefined;
  export let outline: boolean = false;
  export let styleGap: string | undefined = undefined;
</script>

<style>
  .radio {
    display: flex;
    border-radius: var(--border-radius-tiny);
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
  .outline {
    display: flex;
    border: 1px solid var(--color-fill-secondary);
    padding: 3px;
    border-radius: var(--border-radius-small);
    gap: 0.25rem;
  }
</style>

<div aria-label={ariaLabel} class="radio" class:outline style:gap={styleGap}>
  <slot />
</div>
