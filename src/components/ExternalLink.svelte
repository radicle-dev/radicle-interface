<svelte:options customElement="radicle-external-link" />

<script lang="ts">
  import IconSmall from "./IconSmall.svelte";

  export let href: string;
</script>

<style>
  a {
    font-weight: var(--font-weight-semibold);
    color: inherit;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
    text-underline-offset: 2px;
    color: var(--color-fill-secondary);
  }

  .icon {
    color: var(--color-foreground-dim);
    position: relative;
    bottom: 1px;
  }

  a:hover .icon {
    color: var(--color-fill-secondary-hover);
  }
</style>

<a {href} target="_blank" rel="noreferrer">
  <slot>{href}</slot>
  <span class="icon"><IconSmall name="arrow-box-up-right" /></span>
</a>
