<script lang="ts">
  import type { Remote } from "@httpd-client";
  import { type Route } from "@app/lib/router";

  import { closeFocused } from "@app/components/ModalToggle.svelte";
  import { formatNodeId } from "@app/lib/utils";
  import { pluralize } from "@app/lib/pluralize";

  import Authorship from "@app/components/Authorship.svelte";
  import Badge from "@app/components/Badge.svelte";
  import DropdownList from "@app/components/DropdownList.svelte";
  import DropdownListItem from "@app/components/DropdownList/DropdownListItem.svelte";
  import ModalToggle from "@app/components/ModalToggle.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";
  import Button from "@app/components/Button.svelte";

  export let peers: Array<{ remote: Remote; selected: boolean; route: Route }>;

  $: selectedPeer = peers.find(p => p.selected)?.remote;

  function createTitle(p: Remote): string {
    const nodeId = formatNodeId(p.id);
    return p.delegate
      ? `${nodeId} is a delegate of this project`
      : `${nodeId} is a peer tracked by this node`;
  }

  let expanded: boolean;
</script>

<style>
  .avatar-id {
    display: flex;
    gap: 0.5rem;
    color: var(--color-fill-secondary);
    align-items: center;
    justify-content: center;
  }
  .avatar-id.selected {
    color: red;
  }
</style>

<ModalToggle bind:expanded>
  <Button slot="toggle" title="Change peer" disabled={!peers}>
    {#if !selectedPeer}
      <IconSmall name="delegate" />
    {/if}

    {#if selectedPeer}
      <Authorship authorId={selectedPeer.id} authorAlias={selectedPeer.alias} />
      {#if selectedPeer.delegate}
        <Badge size="tiny" variant="secondary">delegate</Badge>
      {/if}
    {:else}
      {peers.length}
      {pluralize("remote", peers.length)}
    {/if}
    <IconSmall name={expanded ? "chevron-up" : "chevron-down"} />
  </Button>

  <DropdownList slot="modal" items={peers}>
    <svelte:fragment slot="item" let:item>
      <Link on:afterNavigate={() => closeFocused()} route={item.route}>
        <DropdownListItem
          selected={item.selected}
          title={createTitle(item.remote)}>
          <span class="avatar-id" class:selected={item.selected}>
            <Authorship
              authorAliasColor={item.selected
                ? "--color-foreground-match-background"
                : undefined}
              authorIdColor={item.selected
                ? "--color-foreground-match-background"
                : undefined}
              authorId={item.remote.id}
              authorAlias={item.remote.alias} />
          </span>
          {#if item.remote.delegate}
            <Badge
              size="tiny"
              variant={item.selected ? "background" : "secondary"}>
              delegate
            </Badge>
          {/if}
        </DropdownListItem>
      </Link>
    </svelte:fragment>
  </DropdownList>
</ModalToggle>
