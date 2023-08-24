<script lang="ts">
  import type { BaseUrl, Patch, PatchState, Project } from "@httpd-client";

  import { HttpdClient } from "@httpd-client";
  import { PATCHES_PER_PAGE } from "./router";

  import Button from "@app/components/Button.svelte";
  import DropdownList from "@app/components/DropdownList.svelte";
  import DropdownListItem from "@app/components/DropdownList/DropdownListItem.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import Icon from "@app/components/Icon.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Layout from "./Layout.svelte";
  import Link from "@app/components/Link.svelte";
  import List from "@app/components/List.svelte";
  import Loading from "@app/components/Loading.svelte";
  import Popover, { closeFocused } from "@app/components/Popover.svelte";
  import PatchTeaser from "./Patch/PatchTeaser.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";

  export let baseUrl: BaseUrl;
  export let patches: Patch[];
  export let project: Project;
  export let state: PatchState["status"];

  let loading = false;
  let page = 0;
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
  .patches {
    font-size: var(--font-size-small);
  }
  .more {
    margin-top: 2rem;
    min-height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>

<Layout {baseUrl} {project} activeTab="patches">
  <div class="patches">
    <List items={allPatches}>
      <div slot="header" style="display: flex;">
        <Popover
          popoverPadding="0"
          popoverPositionTop="2.5rem"
          popoverBorderRadius="var(--border-radius-small)">
          <Button
            let:expanded
            slot="toggle"
            ariaLabel="filter-dropdown"
            title="Filter patches by state">
            <div style:color={stateColor[state]}>
              <Icon name="patch" />
            </div>
            {project.patches[state]}
            {state}
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
                <div
                  style:color={item === state
                    ? "var(--color-foreground-white)"
                    : stateColor[item]}>
                  <Icon name="patch" />
                </div>
                {project.patches[item]}
                {item}
              </DropdownListItem>
            </Link>
          </DropdownList>
        </Popover>
      </div>

      <PatchTeaser
        slot="item"
        let:item
        {baseUrl}
        projectId={project.id}
        patch={item} />

      <svelte:fragment slot="body">
        {#if error}
          <ErrorMessage message="Couldn't load patches" {error} />
        {/if}

        {#if project.patches[state] === 0}
          <div style:margin="4rem 0" style:width="100%">
            <Placeholder
              iconName="no-patches"
              caption={`No ${state} patches`} />
          </div>
        {/if}
      </svelte:fragment>
    </List>

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
  </div>
</Layout>
