<script lang="ts">
  import * as router from "@app/router";
  import { Connection, state, session } from "@app/session";
  import { getWallet } from "@app/wallet";
  import { initialize, activeRoute } from "@app/router";
  import { unreachable } from "@app/utils";

  import ColorPalette from "@app/ColorPalette.svelte";
  import ErrorModal from "@app/ErrorModal.svelte";
  import FaucetForm from "@app/base/faucet/Form.svelte";
  import FaucetWithdraw from "@app/base/faucet/Withdraw.svelte";
  import Header from "@app/Header.svelte";
  import Home from "@app/base/home/Index.svelte";
  import Loading from "@app/Loading.svelte";
  import Modal from "@app/Modal.svelte";
  import NotFound from "@app/NotFound.svelte";
  import Profile from "@app/Profile.svelte";
  import Projects from "@app/base/projects/View.svelte";
  import RegistrationCheckNameAvailability from "@app/base/registration/CheckNameAvailability.svelte";
  import RegistrationRegister from "@app/base/registration/Register.svelte";
  import RegistrationValidateName from "@app/base/registration/ValidateName.svelte";
  import RegistrationView from "@app/base/registration/View.svelte";
  import Seeds from "@app/base/seeds/Routes.svelte";
  import Vesting from "@app/base/vesting/Index.svelte";

  initialize();

  const loadWallet = getWallet().then(async wallet => {
    if ($state.connection === Connection.Connected) {
      state.refreshBalance(wallet);
    } else if ($state.connection === Connection.Disconnected) {
      // Update the session state if we're already connected to WalletConnect
      // from a previous session.
      if (wallet.walletConnect.client.connected) {
        await state.connectWalletConnect(wallet);
      } else if (wallet.metamask.connected) {
        await state.connectMetamask(wallet);
      }
    }
    return wallet;
  });

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      const elems = document.querySelectorAll<HTMLElement>("button.primary");
      if (elems.length === 1) {
        // We only allow this when there's one primary button.
        elems[0].click();
      }
    }
  }
</script>

<style>
  .app {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--header-gradient);
    background-repeat: no-repeat;
    background-size: 100% 6rem;
  }
  .wrapper {
    display: flex;
    align-items: center;
    flex-direction: column;
    height: 100%;
  }
  .emoji {
    margin: 1rem 0;
  }
</style>

<svelte:window on:keydown={handleKeydown} />
<svelte:head>
  <title>Radicle</title>
  {#if import.meta.env.PROD}
    <script
      defer
      data-domain="app.radicle.xyz"
      src="https://plausible.io/js/plausible.js"></script>
  {/if}
</svelte:head>

<div class="app">
  {#await loadWallet}
    <!-- Loading wallet -->
    <div class="wrapper">
      <Loading center />
    </div>
  {:then wallet}
    <ColorPalette />
    <Header session={$session} {wallet} />
    <div class="wrapper">
      {#if $activeRoute.type === "home"}
        <Home />
      {:else if $activeRoute.type === "faucet"}
        {#if $activeRoute.params.activeView.type === "form"}
          <FaucetForm {wallet} />
        {:else if $activeRoute.params.activeView.type === "withdraw"}
          <FaucetWithdraw
            {wallet}
            amount={$activeRoute.params.activeView.params.amount} />
        {/if}
      {:else if $activeRoute.type === "seeds"}
        <Seeds {wallet} session={$session} host={$activeRoute.params.host} />
      {:else if $activeRoute.type === "registration"}
        {#if $activeRoute.params.activeView.type === "validateName"}
          <RegistrationValidateName {wallet} />
        {:else if $activeRoute.params.activeView.type === "checkNameAvailability"}
          <RegistrationCheckNameAvailability
            {wallet}
            name={$activeRoute.params.activeView.params.nameOrDomain}
            owner={$activeRoute.params.activeView.params.owner} />
        {:else if $activeRoute.params.activeView.type === "register"}
          {#if $session}
            <RegistrationRegister
              {wallet}
              name={$activeRoute.params.activeView.params.nameOrDomain}
              owner={$activeRoute.params.activeView.params.owner}
              session={$session} />
          {:else}
            <ErrorModal
              message={"You must connect your wallet to register"}
              on:close={() => {
                router.push({
                  type: "registration",
                  params: { activeView: { type: "validateName" } },
                });
              }} />
          {/if}
        {:else if $activeRoute.params.activeView.type === "view"}
          <RegistrationView
            {wallet}
            retry={$activeRoute.params.activeView.params.retry}
            domain={$activeRoute.params.activeView.params.nameOrDomain} />
        {:else}
          {unreachable($activeRoute.params.activeView)}
        {/if}
      {:else if $activeRoute.type === "vesting"}
        <Vesting {wallet} session={$session} />
      {:else if $activeRoute.type === "projects"}
        <Projects {wallet} activeRoute={$activeRoute} />
      {:else if $activeRoute.type === "profile"}
        <Profile
          addressOrName={$activeRoute.params.addressOrName}
          {wallet} />
      {:else}
        <NotFound title="404" subtitle="Nothing here" />
      {/if}
    </div>
  {:catch err}
    <div class="wrapper">
      <Modal error subtle>
        <span slot="title">
          <div class="emoji">👻</div>
          <div>Error connecting to network</div>
        </span>

        <span slot="body">
          {err.message ? err.message : JSON.stringify(err)}
        </span>
      </Modal>
    </div>
  {/await}
</div>
