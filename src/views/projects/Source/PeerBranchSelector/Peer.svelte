<script lang="ts">
  import type { ProjectRoute } from "@app/views/projects/router";
  import type { Remote } from "@http-client";

  import { closeFocused } from "@app/components/Popover.svelte";
  import { formatCommit } from "@app/lib/utils";
  import { replace } from "@app/lib/router";

  import Badge from "@app/components/Badge.svelte";
  import DropdownListItem from "@app/components/DropdownList/DropdownListItem.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";
  import NodeId from "@app/components/NodeId.svelte";

  export let baseRoute: Extract<
    ProjectRoute,
    { resource: "project.source" } | { resource: "project.history" }
  >;
  export let peer: { remote: Remote; selected: boolean };
  export let revision: string | undefined = undefined;

  const subgridStyle =
    "display: grid; grid-template-columns: subgrid; grid-column: span 2;";
  let expanded = false;
</script>

<style>
  .subgrid-item {
    display: grid;
    grid-template-columns: subgrid;
    grid-column: span 2;
  }
</style>

<div class="subgrid-item" aria-label="peer-item">
  <div class="global-flex-item" style="padding: 0.5rem 0">
    <IconButton title="Expand peer" on:click={() => (expanded = !expanded)}>
      <IconSmall name={expanded ? "chevron-down" : "chevron-right"} />
    </IconButton>
    <NodeId
      subject="Node Id"
      nodeId={peer.remote.id}
      alias={peer.remote.alias} />
    {#if peer.remote.delegate}
      <Badge size="tiny" variant="delegate">
        <IconSmall name="badge" />
        <span class="global-hide-on-small-desktop-down">Delegate</span>
      </Badge>
    {/if}
  </div>
</div>
{#if expanded}
  {#each Object.entries(peer.remote.heads) as [name, head]}
    <Link
      style={subgridStyle}
      route={{
        ...baseRoute,
        peer: peer.remote.id,
        revision: name,
      }}
      on:afterNavigate={() => closeFocused()}>
      <DropdownListItem
        selected={peer.selected && revision === name}
        on:click={() =>
          replace({
            ...baseRoute,
            peer: peer.remote.id,
            revision: name,
          })}
        style={`${subgridStyle} padding-left: 2.3rem; gap: inherit;`}>
        <div class="global-flex-item">
          <IconSmall name="branch" />
          <span class="txt-overflow">
            {name}
          </span>
        </div>
        <div class="global-flex-item">
          <span
            class="txt-monospace"
            style="color: var(--color-foreground-dim);">
            {formatCommit(head)}
          </span>
        </div>
      </DropdownListItem>
    </Link>
  {/each}
{/if}
