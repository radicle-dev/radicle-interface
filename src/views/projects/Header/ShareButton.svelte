<script lang="ts">
  import type { ProjectRoute } from "@app/views/projects/router";

  import { queryProject } from "@app/lib/projects";
  import { config } from "@app/lib/config";
  import { formatPublicExplorer } from "@app/lib/utils";
  import { routeToPath, urlToRoute } from "@app/lib/router";

  import Clipboard from "@app/components/Clipboard.svelte";
  import Command from "@app/components/Command.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Loading from "@app/components/Loading.svelte";
  import IconButton from "@app/components/IconButton.svelte";

  export let preferredSeeds: string[];
  export let publicExplorer: string;

  let usedFallbackSeed = false;

  const route = urlToRoute(new URL(window.location.href)) as ProjectRoute;
  const seedRoutes = preferredSeeds.reduce<ProjectRoute[]>((acc, seed) => {
    const [, address] = seed.split("@");
    acc.push({
      ...route,
      node: {
        hostname: address.split(":")[0],
        port: config.nodes.defaultHttpdPort,
        scheme: config.nodes.defaultHttpdScheme,
      },
    });
    return acc;
  }, []);

  // Set seed.radicle.garden as fallback seed.
  $: if (preferredSeeds.length === 0) {
    usedFallbackSeed = true;
    seedRoutes.push({
      ...route,
      node: {
        hostname: config.nodes.defaultHttpdHostname,
        port: config.nodes.defaultHttpdPort,
        scheme: config.nodes.defaultHttpdScheme,
      },
    });
  }
</script>

<style>
  .share {
    width: 22rem;
    font-size: var(--font-size-small);
  }
  .seed-list {
    padding: 0;
    margin: 1rem 0 0 0;
  }
  li.seed-item:not(:last-child) {
    margin-bottom: 0.5rem;
  }

  .seed-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 2rem;
  }
  .seed {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    min-width: 0;
    margin-right: 0.5rem;
  }

  .help {
    display: flex;
    flex-direction: column;
    border-top: 1px solid var(--color-fill-separator);
    gap: 1rem;
    padding-top: 1rem;
    margin-top: 1rem;
  }
  .notFound {
    color: var(--color-foreground-dim);
  }
</style>

<div class="share">
  <div class="txt-bold" style:padding-bottom="0.5rem">
    You're on your local node
  </div>
  <div>
    Copy a link to this page on a public seed node, accessible by everyone.
  </div>
  <ul class="seed-list">
    {#each seedRoutes as seed}
      {#await queryProject(seed.node, seed.project)}
        <li class="seed-item">
          <span class="seed txt-bold">
            <IconSmall name="globe" />
            <span class="txt-overflow">
              {seed.node.hostname}/{seed.project}
            </span>
          </span>
          <span style:height="1.5rem">
            <Loading center small noDelay condensed />
          </span>
        </li>
      {:then state}
        {@const path = routeToPath(seed)}
        <li
          class="seed-item"
          class:notFound={state === "notFound"}
          title={state === "notFound"
            ? "Not available on this public seed node"
            : ""}>
          <div class="seed txt-bold">
            <IconSmall name="globe" />
            <span class="txt-overflow">
              {path.replace("/nodes/", "")}
            </span>
          </div>
          <div style="display: flex; align-items: center;">
            {#if state === "found"}
              <IconButton>
                <Clipboard
                  text={formatPublicExplorer(
                    publicExplorer,
                    seed.node.hostname,
                    seed.project,
                    path,
                  )} />
              </IconButton>
              <IconButton>
                <a
                  href={path}
                  target="_blank"
                  style=" width: 1.5rem;
                height: 1.5rem; display: flex; align-items: center; justify-content: center;">
                  <IconSmall name="arrow-box-up-right" />
                </a>
              </IconButton>
            {:else}
              <IconButton>
                <IconSmall name="clipboard" />
              </IconButton>
              <IconButton>
                <IconSmall name="arrow-box-up-right" />
              </IconButton>
            {/if}
          </div>
        </li>
      {/await}
    {/each}
    {#if usedFallbackSeed}
      <div class="help">
        <div>
          <div class="txt-bold" style:padding-bottom="0.5rem">
            Add more seed nodes
          </div>
          <div>Update your preferred seeds in your Radicle config.</div>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-direction: column;">
          <div>Run the following command to locate your config:</div>
          <Command command="rad self --config" fullWidth />
        </div>
      </div>
    {/if}
  </ul>
</div>
