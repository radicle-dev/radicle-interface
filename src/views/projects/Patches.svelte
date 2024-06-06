<script lang="ts">
  import type { BaseUrl, Node, Patch, PatchState, Project } from "@http-client";

  import { HttpdClient } from "@http-client";
  import capitalize from "lodash/capitalize";

  import { PATCHES_PER_PAGE } from "./router";
  import { experimental } from "@app/lib/appearance";
  import { httpdStore } from "@app/lib/httpd";
  import { baseUrlToString, isLocal } from "@app/lib/utils";

  import Button from "@app/components/Button.svelte";
  import DropdownList from "@app/components/DropdownList.svelte";
  import DropdownListItem from "@app/components/DropdownList/DropdownListItem.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Layout from "./Layout.svelte";
  import Link from "@app/components/Link.svelte";
  import List from "@app/components/List.svelte";
  import Loading from "@app/components/Loading.svelte";
  import PatchTeaser from "./Patch/PatchTeaser.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import Popover, { closeFocused } from "@app/components/Popover.svelte";
  import Share from "./Share.svelte";
  import Command from "@app/components/Command.svelte";

  export let baseUrl: BaseUrl;
  export let node: Node;
  export let patches: Patch[];
  export let project: Project;
  export let state: PatchState["status"];

  let loading = false;
  let page = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let error: any;
  let allPatches: Patch[];

  $: {
    allPatches = patches;
    page = 0;
  }

  const api = new HttpdClient(baseUrl);

  async function loadMore(state: PatchState["status"]): Promise<void> {
    loading = true;
    page += 1;
    try {
      const response = await api.project.getAllPatches(project.id, {
        state,
        page,
        perPage: PATCHES_PER_PAGE,
      });
      allPatches = [...allPatches, ...response];
    } catch (e) {
      error = e;
    } finally {
      loading = false;
    }
  }

  const stateOptions: PatchState["status"][] = [
    "draft",
    "open",
    "archived",
    "merged",
  ];

  const stateColor: Record<PatchState["status"], string> = {
    draft: "var(--color-fill-gray)",
    open: "var(--color-fill-success)",
    archived: "var(--color-foreground-yellow)",
    merged: "var(--color-fill-primary)",
  };

  $: showMoreButton =
    !loading && !error && allPatches.length < project.patches[state];
</script>

<style>
  .more {
    margin-top: 2rem;
    min-height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .dropdown-button-counter {
    border-radius: var(--border-radius-tiny);
    background-color: var(--color-fill-counter);
    color: var(--color-foreground-contrast);
    padding: 0 0.25rem;
  }
  .dropdown-list-counter {
    border-radius: var(--border-radius-tiny);
    background-color: var(--color-fill-ghost);
    color: var(--color-foreground-dim);
    padding: 0 0.25rem;
  }
  .selected {
    background-color: var(--color-fill-counter);
    color: var(--color-foreground-dim);
  }
  .popover {
    min-width: 16rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .placeholder {
    height: calc(100% - 4rem);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  @media (max-width: 719.98px) {
    .placeholder {
      height: calc(100vh - 10rem);
    }
  }
</style>

<Layout {node} {baseUrl} {project} activeTab="patches">
  <div slot="header" style:display="flex" style:padding="1rem">
    <Popover
      popoverPadding="0"
      popoverPositionTop="2.5rem"
      popoverBorderRadius="var(--border-radius-small)">
      <Button
        let:expanded
        slot="toggle"
        let:toggle
        on:click={toggle}
        ariaLabel="filter-dropdown"
        title="Filter patches by state">
        <div style:color={stateColor[state]}>
          <IconSmall name="patch" />
        </div>
        {capitalize(state)}
        <div class="dropdown-button-counter">
          {project.patches[state]}
        </div>
        <IconSmall name={expanded ? "chevron-up" : "chevron-down"} />
      </Button>
      <DropdownList slot="popover" items={stateOptions}>
        <Link
          slot="item"
          let:item
          on:afterNavigate={() => closeFocused()}
          route={{
            resource: "project.patches",
            project: project.id,
            node: baseUrl,
            search: `state=${item}`,
          }}>
          <DropdownListItem selected={item === state}>
            <div style:color={stateColor[item]}>
              <IconSmall name="patch" />
            </div>
            <div
              style="display: flex; gap: 1rem;justify-content: space-between; width: 100%;">
              {capitalize(item)}
              <div
                class="dropdown-list-counter"
                class:selected={item === state}>
                {project.patches[item]}
              </div>
            </div>
          </DropdownListItem>
        </Link>
      </DropdownList>
    </Popover>

    <div style="margin-left: auto; display: flex; gap: 1rem;">
      <Share {baseUrl} />
      {#if $experimental && $httpdStore.state === "authenticated" && isLocal(baseUrl.hostname)}
        <div class="global-hide-on-mobile-down">
          <Popover popoverPositionTop="2.5rem" popoverPositionRight="0">
            <Button
              slot="toggle"
              let:toggle
              on:click={toggle}
              variant="secondary">
              <IconSmall name="plus" />
              New Patch
            </Button>

            <div slot="popover" class="popover txt-small">
              To create a patch, first checkout a new branch and commit your
              changes, then run the following command.
              <Command command="git push rad HEAD:refs/patches" />
            </div>
          </Popover>
        </div>
      {/if}
    </div>
  </div>

  <List items={allPatches}>
    <PatchTeaser
      slot="item"
      let:item
      {baseUrl}
      projectId={project.id}
      patch={item} />
  </List>

  {#if error}
    <ErrorMessage
      title="Couldn't load patches"
      description="Please make sure you are able to connect to the seed <code>${baseUrlToString(
        api.baseUrl,
      )}</code>"
      {error} />
  {/if}

  {#if project.patches[state] === 0}
    <div class="placeholder">
      <Placeholder iconName="no-patches" caption={`No ${state} patches`} />
    </div>
  {/if}

  {#if loading || showMoreButton}
    <div class="more">
      {#if loading}
        <div style:margin-top={page === 0 ? "8rem" : ""}>
          <Loading noDelay small={page !== 0} center />
        </div>
      {/if}

      {#if showMoreButton}
        <Button size="large" variant="outline" on:click={() => loadMore(state)}>
          More
        </Button>
      {/if}
    </div>
  {/if}
</Layout>
