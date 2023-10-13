<script lang="ts">
  import type { BaseUrl, Issue, IssueState, Project } from "@httpd-client";

  import { HttpdClient } from "@httpd-client";
  import { ISSUES_PER_PAGE } from "./router";
  import { closeFocused } from "@app/components/Popover.svelte";
  import { authenticatedLocal } from "@app/lib/httpd";

  import Button from "@app/components/Button.svelte";
  import DropdownList from "@app/components/DropdownList.svelte";
  import DropdownListItem from "@app/components/DropdownList/DropdownListItem.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import Icon from "@app/components/Icon.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import IssueTeaser from "@app/views/projects/Issue/IssueTeaser.svelte";
  import Layout from "./Layout.svelte";
  import Link from "@app/components/Link.svelte";
  import List from "@app/components/List.svelte";
  import Loading from "@app/components/Loading.svelte";
  import Popover from "@app/components/Popover.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";

  export let baseUrl: BaseUrl;
  export let issues: Issue[];
  export let project: Project;
  export let state: IssueState["status"];
  export let tracking: boolean;

  let loading = false;
  let page = 0;
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
  .issues {
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

<Layout {baseUrl} {project} {tracking} activeTab="issues">
  <div class="issues">
    <List items={allIssues}>
      <div slot="header" style="display: flex;">
        <Popover
          popoverPadding="0"
          popoverPositionTop="2.5rem"
          popoverBorderRadius="var(--border-radius-small)">
          <Button
            let:expanded
            slot="toggle"
            ariaLabel="filter-dropdown"
            title="Filter issues by state">
            <div style:color={stateColor[state]}>
              <Icon name="issue" />
            </div>
            {project.issues[state]}
            {state}
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
                <div
                  style:color={item === state
                    ? "var(--color-foreground-white)"
                    : stateColor[item]}>
                  <Icon name="issue" />
                </div>
                {project.issues[item]}
                {item}
              </DropdownListItem>
            </Link>
          </DropdownList>
        </Popover>
        {#if $authenticatedLocal(baseUrl.hostname)}
          <div style="margin-left: auto;">
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

      <IssueTeaser
        slot="item"
        let:item
        {baseUrl}
        projectId={project.id}
        issue={item} />

      <svelte:fragment slot="body">
        {#if error}
          <ErrorMessage message="Couldn't load issues" {error} />
        {/if}

        {#if project.issues[state] === 0}
          <div style:margin="4rem 0" style:width="100%">
            <Placeholder iconName="no-issues" caption={`No ${state} issues`} />
          </div>
        {/if}
      </svelte:fragment>
    </List>

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
  </div>
</Layout>
