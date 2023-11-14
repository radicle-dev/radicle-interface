<script lang="ts">
  import IconSmall from "./IconSmall.svelte";

  export let href: string;
</script>

<style>
  a {
    font-weight: var(--font-weight-semibold);
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    text-decoration: none;
    box-shadow: 0 1px 0 0 var(--color-foreground-contrast);
  }

  a:hover {
    color: var(--color-fill-secondary);
    box-shadow: 0 1px 0 0 var(--color-fill-secondary);
  }

  .icon {
    color: var(--color-foreground-gray);
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
