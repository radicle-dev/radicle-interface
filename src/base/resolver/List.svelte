<script lang="ts">
  import Modal from "@app/Modal.svelte";
  import Address from "@app/Address.svelte";
  import type { Config } from "@app/config";
  import { Profile } from "@app/profile";
  import Loading from "@app/Loading.svelte";
  import Button from "@app/Button.svelte";

  export let config: Config;

  const { query } = window.history.state;
  const back = () => window.history.back();
</script>

<style>
  .list {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>

<Modal subtle>
  <span slot="title">️🔍</span>
  <span slot="subtitle">
    <p class="highlight text-medium">
      <strong>Multiple names found for {query}</strong>
    </p>
  </span>
  <span slot="body">
    <div class="list">
      {#await Profile.getMulti([`${query}.${config.registrar.domain}`, `${query}.eth`], config)}
        <Loading center />
      {:then profiles}
        {#each profiles as profile}
          {#if profile}
            <Address address={profile.address} {profile} {config} resolve />
          {/if}
        {/each}
      {/await}
    </div>
  </span>
  <span slot="actions">
    <Button variant="foreground" on:click={back}>Back</Button>
  </span>
</Modal>
