<script lang="ts">
  import type { Remote } from "@httpd-client";
  import { type Route } from "@app/lib/router";

  import { closeFocused } from "@app/components/Floating.svelte";
  import { formatNodeId, truncateId } from "@app/lib/utils";
  import { pluralize } from "@app/lib/pluralize";

  import Avatar from "@app/components/Avatar.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Dropdown from "@app/components/Dropdown.svelte";
  import DropdownItem from "@app/components/Dropdown/DropdownItem.svelte";
  import Floating from "@app/components/Floating.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Link from "@app/components/Link.svelte";

  export let peers: Array<{ remote: Remote; selected: boolean; route: Route }>;

  $: selectedPeer = peers.find(p => p.selected)?.remote;

  function createTitle(p: Remote): string {
    const nodeId = formatNodeId(p.id);
    return p.delegate
      ? `${nodeId} is a delegate of this project`
      : `${nodeId} is a peer tracked by this node`;
  }
</script>

<style>
  .selector {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-family-monospace);
  }
  .title {
    display: flex;
    gap: 0.5rem;
    font-family: var(--font-family-sans-serif);
    font-weight: var(--font-weight-medium);
  }
  .selector .peer {
    padding: 0.5rem 0.75rem;
    color: var(--color-secondary);
    background-color: var(--color-fill-ghost);
    border-radius: var(--border-radius-small);
    font-weight: var(--font-weight-medium);
  }
  .dropdown-item {
    font-family: var(--font-family-monospace);
    font-weight: var(--font-weight-medium);
  }
  .selector .peer.not-allowed {
    cursor: not-allowed;
  }
  .peer:hover {
    background-color: var(--color-fill-ghost-hover);
  }
  .prefix {
    display: inline-block;
    color: var(--color-secondary-6);
  }
  .stat {
    display: flex;
    align-items: center;
    font-family: var(--font-family-monospace);
    padding: 0.5rem;
    height: 2rem;
    line-height: initial;
    background: var(--color-foreground-1);
    gap: 0.5rem;
  }
  .avatar-id {
    display: flex;
    gap: 0.25rem;
    color: var(--color-fill-secondary);
  }
  .alias {
    color: var(--color-foreground-dim);
  }
</style>

<Floating>
  <div slot="toggle" class="selector" title="Change peer">
    <div class="stat peer" class:not-allowed={!peers}>
      {#if selectedPeer}
        <span class="avatar-id">
          <Avatar nodeId={selectedPeer.id} inline />
          <!-- Ignore prettier to avoid getting a whitespace between
             did:key: and the nid due to a newline. -->
          <!-- prettier-ignore -->
          <span><span style:color="var(--color-secondary-5)">did:key:</span>{truncateId(selectedPeer.id)}</span>
          {#if selectedPeer.alias}
            <span class="alias">({selectedPeer.alias})</span>
          {/if}
        </span>
        {#if selectedPeer.delegate}
          <Badge variant="secondary">delegate</Badge>
        {/if}
      {:else}
        <div class="title">
          <Icon size="small" name="fork" />{peers.length}
          {pluralize("remote", peers.length)}
        </div>
      {/if}
    </div>
  </div>

  <svelte:fragment slot="modal">
    <Dropdown items={peers}>
      <svelte:fragment slot="item" let:item>
        <div class="dropdown-item">
          <Link on:afterNavigate={() => closeFocused()} route={item.route}>
            <DropdownItem
              selected={item.selected}
              title={createTitle(item.remote)}
              size="tiny">
              <span class="avatar-id">
                <Avatar nodeId={item.remote.id} inline />
                <div class="layout-desktop">
                  <!-- prettier-ignore -->
                  <span><span class="prefix">did:key:</span>{item.remote.id}</span>
                  {#if item.remote.alias}
                    <span class="alias">({item.remote.alias})</span>
                  {/if}
                </div>
                <div class="layout-mobile">
                  <!-- prettier-ignore -->
                  <span><span class="prefix">did:key:</span>{truncateId(item.remote.id)}</span>
                  {#if item.remote.alias}
                    <span class="alias">({item.remote.alias})</span>
                  {/if}
                </div>
              </span>
              {#if item.remote.delegate}
                <Badge variant="secondary">delegate</Badge>
              {/if}
            </DropdownItem>
          </Link>
        </div>
      </svelte:fragment>
    </Dropdown>
  </svelte:fragment>
</Floating>
