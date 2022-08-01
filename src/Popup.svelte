<script lang="ts"></script>

<style>
  .popup {
    color: var(--color-foreground);
    width: 14rem;
    left: -1rem;
    z-index: 99;
  }

  @media (max-width: 720px) {}
</style>

<div class="popup">
  <slot />
</div>
