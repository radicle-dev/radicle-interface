<script lang="ts" context="module">
  export interface Params {
    seedHost: string | null;
    profileName: string | null;
    peer: string | null;
    revision: string | null;
    urn: string;
    content: string;
  }
</script>

<script lang="ts">
  import type { Config } from "@app/config";
  import Project from "./Project.svelte";
  import * as proj from "@app/project";
  import Loading from "@app/Loading.svelte";

  export let config: Config;
  export let params: Params;
</script>

{#await proj.Project.get(params.urn, params.peer, params.profileName, params.seedHost, config)}
  <Loading center />
{:then project}
  <Project
    {config}
    {project}
    peer={params.peer}
    content={params.content}
    revision={params.revision || project.head} />
{/await}
