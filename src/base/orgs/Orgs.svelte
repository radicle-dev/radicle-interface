<script lang="typescript">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { Router, Link, Route, navigate } from "svelte-routing";
  import { ethers } from 'ethers';
  import { error } from '@app/error';
  import { session } from '@app/session';
  import CreateOrg from '@app/base/orgs/CreateOrg.svelte';

  enum State {
    Idle,
  }

  export let config;
  export const query = {};

  let modal = null;
  let state = State.Idle;

  $: owner = $session && $session.address;
</script>

<style>
</style>

<main>
  <button on:click={() => modal = CreateOrg} disabled={!owner} class="secondary">
    Create an Org
  </button>
</main>

<svelte:component this="{modal}" {owner} {config} on:close={() => modal = null} />
