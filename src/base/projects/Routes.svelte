<script lang="ts">
  import { Route } from "svelte-routing";
  import View from '@app/base/projects/View.svelte';
  import type { Config } from '@app/config';
  import { ProjectContent } from "@app/project";

  export let config: Config;

  function parseContent(content: string): ProjectContent {
    return content == "history" ? ProjectContent.History : ProjectContent.Tree;
  }
</script>

<Route path="/projects/:urn/:content/head/*" let:params>
  <View {config} urn={params.urn} content={parseContent(params.content)} path={params['*'] || "/"} />
</Route>

<Route path="/projects/:urn/:content/:commit/*" let:params>
  <View {config} urn={params.urn} content={parseContent(params.content)} commit={params.commit} path={params['*'] || "/"} />
</Route>

<Route path="/projects/:urn" let:params>
  <View {config} urn={params.urn} path="/" />
</Route>

<!-- With an Org context -->

<Route path="/orgs/:org/projects/:urn/:content/head/*" let:params>
  <View {config} org={params.org} urn={params.urn} content={parseContent(params.content)} path={params['*'] || "/"} />
</Route>

<Route path="/orgs/:org/projects/:urn/:content/:commit/*" let:params>
  <View {config} org={params.org} urn={params.urn} content={parseContent(params.content)} commit={params.commit} path={params["*"] || "/"} />
</Route>

<Route path="/orgs/:org/projects/:urn" let:params>
  <View {config} org={params.org} urn={params.urn} path="/" />
</Route>

<!-- With a User context -->

<Route path="/users/:user/projects/:urn/:content/head/*" let:params>
  <View {config} user={params.user} urn={params.urn} content={parseContent(params.content)} path={params['*'] || "/"} />
</Route>

<Route path="/users/:user/projects/:urn/:content/:commit/*" let:params>
  <View {config} user={params.user} urn={params.urn} content={parseContent(params.content)} commit={params.commit} path={params["*"] || "/"} />
</Route>

<Route path="/users/:user/projects/:urn" let:params>
  <View {config} user={params.user} urn={params.urn} path="/" />
</Route>
