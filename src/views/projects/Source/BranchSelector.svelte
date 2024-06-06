<script lang="ts">
  import type { BaseUrl, Commit, Project } from "@http-client";
  import type { Route } from "@app/lib/router";

  import { activeUnloadedRouteStore } from "@app/lib/router";
  import { closeFocused } from "@app/components/Popover.svelte";

  import Badge from "@app/components/Badge.svelte";
  import Button from "@app/components/Button.svelte";
  import CommitButton from "@app/views/projects/components/CommitButton.svelte";
  import DropdownList from "@app/components/DropdownList.svelte";
  import DropdownListItem from "@app/components/DropdownList/DropdownListItem.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";
  import Popover from "@app/components/Popover.svelte";

  export let onCanonical: boolean;
  export let branches: Array<{ name: string; route: Route }>;
  export let node: BaseUrl;
  export let project: Project;
  export let selectedBranch: string | undefined;
  export let selectedCommit: Commit["commit"];
</script>

<style>
  .branch {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .identifier {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>

<div class="branch">
  {#if selectedBranch}
    <Popover
      popoverPadding="0"
      popoverPositionTop="2.5rem"
      popoverBorderRadius="var(--border-radius-tiny)">
      <Button
        variant="gray-white"
        let:expanded
        let:toggle
        on:click={toggle}
        slot="toggle"
        styleBorderRadius="var(--border-radius-tiny) 0 0 var(--border-radius-tiny)"
        title="Change branch">
        <IconSmall name="branch" />
        <div class="identifier">{selectedBranch}</div>
        {#if onCanonical}
          <Badge title="Canonical branch" variant="foreground-emphasized">
            Canonical
          </Badge>
        {/if}
        <IconSmall name={expanded ? "chevron-up" : "chevron-down"} />
      </Button>

      <DropdownList
        slot="popover"
        styleDropdownMinWidth="7.5rem"
        items={branches}>
        <svelte:fragment slot="item" let:item>
          <Link route={item.route} on:afterNavigate={() => closeFocused()}>
            <DropdownListItem selected={item.name === selectedBranch}>
              <IconSmall name="branch" />
              <div class="identifier">
                {item.name}
              </div>
              {#if onCanonical}
                <Badge title="Canonical branch" variant="foreground-emphasized">
                  Canonical
                </Badge>
              {/if}
            </DropdownListItem>
          </Link>
        </svelte:fragment>
        <svelte:fragment slot="empty">
          <Link
            route={$activeUnloadedRouteStore}
            on:afterNavigate={() => closeFocused()}>
            <DropdownListItem selected>
              <IconSmall name="branch" />
              <div class="identifier">
                {project.defaultBranch}
              </div>
            </DropdownListItem>
          </Link>
        </svelte:fragment>
      </DropdownList>
    </Popover>
  {/if}

  <div class="global-spacer" />
  <CommitButton projectId={project.id} commit={selectedCommit} baseUrl={node} />
</div>
