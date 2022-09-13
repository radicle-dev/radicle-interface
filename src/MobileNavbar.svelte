<script lang="ts">
  import { link } from "svelte-routing";
  import { createEventDispatcher } from "svelte";
  import Search from "./Search.svelte";
  import { clickOutside } from "@app/utils";

  const dispatch = createEventDispatcher();

  function handleClickOutside() {
    dispatch("select");
  }
</script>

<style>
  .modal-floating {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .modal-floating {
    z-index: 300;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #000000bf;
  }
  .modal {
    position: absolute;
    top: 90px;
    right: 1.5rem;
    padding: 1.5rem;
    font-family: var(--font-family-sans-serif);
    background: var(--color-background);
    min-width: 240px;
    max-width: 360px;
    border-radius: var(--border-radius-tiny);
    text-align: center;
  }
  .modal-title {
    color: var(--color-foreground);
    font-size: var(--font-size-regular);
    line-height: 2rem;
    text-align: left;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .modal-title a {
    color: var(--color-foreground-6);
    padding-left: 1.5rem;
  }
  .modal-title a:hover {
    color: var(--color-foreground);
  }
  .modal-title a:first-child {
    padding-left: 0.5rem;
  }
</style>

<div class="modal-floating">
  <div use:clickOutside={handleClickOutside} class="modal">
    <div class="modal-title">
      <div style="padding-bottom: 1rem;">
        <Search size={20} on:search={() => dispatch("select")} />
      </div>
      <div>
        <a use:link on:click={() => dispatch("select")} href="/orgs">Orgs</a>
        <a use:link on:click={() => dispatch("select")} href="/registrations">
          Register
        </a>
      </div>
    </div>
  </div>
</div>
