<script lang="ts">
  import type { BaseUrl, Remote } from "@httpd-client";
  import type { LoadedSourceBrowsingView } from "@app/views/projects/router";

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

  export let baseUrl: BaseUrl;
  export let peer: string | undefined = undefined;
  export let peers: Remote[];
  export let projectId: string;
  export let view: LoadedSourceBrowsingView;

  $: meta = peers.find(p => p.id === peer);

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
  .selector .peer {
    padding: 0.5rem 0.75rem;
    color: var(--color-secondary);
    background-color: var(--color-secondary-2);
    border-radius: var(--border-radius-small);
  }
  .selector .peer.not-allowed {
    cursor: not-allowed;
  }
  .peer:hover {
    background-color: var(--color-foreground-2);
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
  }
  .alias {
    color: var(--color-secondary-6);
  }
</style>

<Floating>
  <div slot="toggle" class="selector" title="Change peer">
    <div class="stat peer" class:not-allowed={!peers}>
      {#if !peer}
        <Icon size="small" name="fork" />{peers.length}
        {pluralize("remote", peers.length)}
      {/if}
      {#if meta}
        <span class="avatar-id">
          <Avatar nodeId={meta.id} inline />
          <!-- Ignore prettier to avoid getting a whitespace between
             did:key: and the nid due to a newline. -->
          <!-- prettier-ignore -->
          <span><span style:color="var(--color-secondary-5)">did:key:</span>{truncateId(meta.id)}</span>
          {#if meta.alias}
            <span class="alias">({meta.alias})</span>
          {/if}
        </span>
        {#if meta.delegate}
          <Badge variant="primary">delegate</Badge>
        {/if}
      {:else if peer}
        <span class="avatar-id">
          <Avatar nodeId={peer} inline />
          <!-- prettier-ignore -->
          <span><span style:color="var(--color-secondary-5)">did:key:</span>{truncateId(peer)}</span>
        </span>
      {/if}
    </div>
  </div>

  <svelte:fragment slot="modal">
    <Dropdown items={peers}>
      <svelte:fragment slot="item" let:item>
        <div class="dropdown-item">
          <Link
            on:afterNavigate={() => closeFocused()}
            route={{
              resource: "projects",
              params: {
                id: projectId,
                baseUrl,
                peer: item.id,
                revision: undefined,
                view,
              },
            }}>
            <DropdownItem
              selected={item.id === peer}
              title={createTitle(item)}
              size="tiny">
              <span class="avatar-id">
                <Avatar nodeId={item.id} inline />
                <div class="layout-desktop">
                  <!-- prettier-ignore -->
                  <span><span class="prefix">did:key:</span>{item.id}</span>
                  {#if item.alias}
                    <span class="alias">({item.alias})</span>
                  {/if}
                </div>
                <div class="layout-mobile">
                  <!-- prettier-ignore -->
                  <span><span class="prefix">did:key:</span>{truncateId(item.id)}</span>
                  {#if item.alias}
                    <span class="alias">({item.alias})</span>
                  {/if}
                </div>
              </span>
              {#if item.delegate}
                <Badge variant="primary">delegate</Badge>
              {/if}
            </DropdownItem>
          </Link>
        </div>
      </svelte:fragment>
    </Dropdown>
  </svelte:fragment>
</Floating>
