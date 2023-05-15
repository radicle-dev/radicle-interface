<script lang="ts" strictEvents>
  import type { Item } from "@app/components/Dropdown.svelte";
  import type { Remote } from "@httpd-client";

  import { onMount } from "svelte";

  import { formatNodeId, truncateId } from "@app/lib/utils";

  import Avatar from "@app/components/Avatar.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Dropdown from "@app/components/Dropdown.svelte";
  import Floating from "@app/components/Floating.svelte";
  import Icon from "@app/components/Icon.svelte";
  import ProjectLink from "@app/components/ProjectLink.svelte";

  export let peer: string | undefined = undefined;
  export let peers: Remote[];

  let meta: Remote | undefined;

  let items: Item<string>[] = [];

  function createTitle(p: Remote): string {
    const nodeId = formatNodeId(p.id);
    return p.delegate
      ? `${nodeId} is a delegate of this project`
      : `${nodeId} is a peer tracked by this node`;
  }

  onMount(() => {
    meta = peers.find(p => p.id === peer);
    items = peers.map(p => {
      return {
        value: p.id,
        alias: p.alias,
        title: createTitle(p),
        badge: p.delegate ? "delegate" : null,
      };
    });
  });
</script>

<style>
  .selector {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-family-monospace);
  }
  .selector .peer {
    padding: 0.5rem;
    color: var(--color-secondary);
    background-color: var(--color-secondary-2);
    border-radius: var(--border-radius-small);
  }
  .selected {
    padding: 0.5rem 0.75rem !important;
  }
  .selector .peer.not-allowed {
    cursor: not-allowed;
  }
  .peer:hover {
    background-color: var(--color-foreground-2);
  }
  .peer-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
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
    <div class="stat peer" class:selected={peer} class:not-allowed={!peers}>
      {#if !peer}
        <Icon name="fork" />
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
    <Dropdown {items} selected={peer}>
      <svelte:fragment slot="item" let:item>
        <ProjectLink
          on:click
          projectParams={{
            peer: item.value,
            revision: undefined,
          }}>
          <div class="peer-item">
            <span class="avatar-id">
              <Avatar nodeId={item.value} inline />
              <div class="layout-desktop">
                <!-- prettier-ignore -->
                <span><span class="prefix">did:key:</span>{item.value}</span>
                {#if item.alias}
                  <span class="alias">({item.alias})</span>
                {/if}
              </div>
              <div class="layout-mobile">
                <!-- prettier-ignore -->
                <span><span class="prefix">did:key:</span>{truncateId(item.value)}</span>
                {#if item.alias}
                  <span class="alias">({item.alias})</span>
                {/if}
              </div>
            </span>
            {#if item.badge}
              <Badge variant="primary">{item.badge}</Badge>
            {/if}
          </div>
        </ProjectLink>
      </svelte:fragment>
    </Dropdown>
  </svelte:fragment>
</Floating>
