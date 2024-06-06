<script lang="ts">
  import type { BaseUrl, Issue, IssueState, Node, Project } from "@http-client";

  import capitalize from "lodash/capitalize";
  import { HttpdClient } from "@http-client";
  import { ISSUES_PER_PAGE } from "./router";
  import { baseUrlToString, isLocal } from "@app/lib/utils";
  import { closeFocused } from "@app/components/Popover.svelte";
  import { experimental } from "@app/lib/appearance";
  import { httpdStore } from "@app/lib/httpd";

  import Button from "@app/components/Button.svelte";
  import DropdownList from "@app/components/DropdownList.svelte";
  import DropdownListItem from "@app/components/DropdownList/DropdownListItem.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import IssueTeaser from "@app/views/projects/Issue/IssueTeaser.svelte";
  import Layout from "./Layout.svelte";
  import Link from "@app/components/Link.svelte";
  import List from "@app/components/List.svelte";
  import Loading from "@app/components/Loading.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import Popover from "@app/components/Popover.svelte";
  import Share from "./Share.svelte";

  export let baseUrl: BaseUrl;
  export let node: Node;
  export let issues: Issue[];
  export let project: Project;
  export let state: IssueState["status"];

  let loading = false;
  let page = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let error: any;
  let allIssues: Issue[];

  $: {
    allIssues = issues;
    page = 0;
  }

  const api = new HttpdClient(baseUrl);

  async function loadIssues(state: IssueState["status"]): Promise<void> {
    loading = true;
    page += 1;
    try {
      const response = await api.project.getAllIssues(project.id, {
        state,
        page,
        perPage: ISSUES_PER_PAGE,
      });
      allIssues = [...allIssues, ...response];
    } catch (e) {
      error = e;
    } finally {
      loading = false;
    }
  }

  const stateOptions: IssueState["status"][] = ["open", "closed"];
  const stateColor: Record<IssueState["status"], string> = {
    open: "var(--color-fill-success)",
    closed: "var(--color-foreground-red)",
  };

  $: showMoreButton =
    !loading && !error && allIssues.length < project.issues[state];
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

<Layout {node} {baseUrl} {project} activeTab="issues">
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
        title="Filter issues by state">
        <div style:color={stateColor[state]}>
          <IconSmall name="issue" />
        </div>
        {capitalize(state)}
        <div class="dropdown-button-counter">
          {project.issues[state]}
        </div>
        <IconSmall name={expanded ? "chevron-up" : "chevron-down"} />
      </Button>

      <DropdownList slot="popover" items={stateOptions}>
        <Link
          on:afterNavigate={() => closeFocused()}
          slot="item"
          let:item
          route={{
            resource: "project.issues",
            project: project.id,
            node: baseUrl,
            state: item,
          }}>
          <DropdownListItem selected={item === state}>
            <div style:color={stateColor[item]}>
              <IconSmall name="issue" />
            </div>
            <div
              style="display: flex; gap: 1rem;justify-content: space-between; width: 100%;">
              {capitalize(item)}
              <div
                class="dropdown-list-counter"
                class:selected={item === state}>
                {project.issues[item]}
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
          <Link
            route={{
              resource: "project.newIssue",
              project: project.id,
              node: baseUrl,
            }}>
            <Button variant="secondary">
              <IconSmall name="plus" />
              New Issue
            </Button>
          </Link>
        </div>
      {/if}
    </div>
  </div>

  <List items={allIssues}>
    <IssueTeaser
      slot="item"
      let:item
      {baseUrl}
      projectId={project.id}
      issue={item} />
  </List>

  {#if error}
    <ErrorMessage
      title="Couldn't load issues"
      description="Please make sure you are able to connect to the seed <code>${baseUrlToString(
        api.baseUrl,
      )}</code>"
      {error} />
  {/if}

  {#if project.issues[state] === 0}
    <div class="placeholder">
      <Placeholder iconName="no-issues" caption={`No ${state} issues`} />
    </div>
  {/if}

  {#if loading || showMoreButton}
    <div class="more">
      {#if loading}
        <Loading noDelay small={page !== 0} center />
      {/if}

      {#if showMoreButton}
        <Button
          size="large"
          variant="outline"
          on:click={() => loadIssues(state)}>
          More
        </Button>
      {/if}
    </div>
  {/if}
</Layout>
