<script lang="ts">
  import type * as proj from '@app/project';
  import AnchorBadge from '@app/base/profiles/AnchorBadge.svelte';

  export let project: proj.ProjectInfo;
  export let faded = false;
  export let anchor: proj.Anchor | null = null;
</script>

<style>
  article {
    padding: 1rem;
    border: 1px solid var(--color-secondary-faded);
    border-radius: 0.25rem;
    min-width: 36rem;
    cursor: pointer;
  }
  article.project-faded {
    border: 1px dashed var(--color-foreground-subtle);
    cursor: not-allowed;
  }
  article:hover {
    border-color: var(--color-secondary);
  }
  article.project-faded:hover {
    border-color: var(--color-foreground-faded);
  }
  article .id {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  article .description {
    margin-bottom: 0.25rem;
    font-size: 0.75rem;
  }
  article .anchor {
    color: var(--color-secondary);
    font-size: 0.75rem;
    min-height: 2rem;
    display: flex;
    align-items: center;
  }
  article .commit, article .actions {
    font-family: var(--font-family-monospace);
  }
  article.project-faded .anchor {
    color: var(--color-foreground-faded);
  }
  article .id, article .anchor {
    display: flex;
    justify-content: space-between;
  }
  article .id .urn {
    visibility: hidden;
    color: var(--color-foreground-faded);
    font-weight: normal;
    font-family: var(--font-family-monospace);
    font-size: 0.75rem;
  }
  article .anchor-badge {
    visibility: hidden;
  }
  article:hover .id .urn {
    visibility: visible;
  }
  article:hover .anchor-badge {
    visibility: visible;
  }
  @media (max-width: 720px) {
    article {
      min-width: 0;
    }
  }
</style>

<article on:click class:project-faded={faded}>
  <div class="id">
    <span class="name">{project.name}</span>
    <span class="urn desktop">{project.urn}</span>
  </div>
  <div class="description">{project.description}</div>
  <div class="anchor">
    <span class="commit">
      <slot name="stateHash">{project.head}</slot>
    </span>
    <span class="actions">
      <slot name="actions">
      </slot>
    </span>
    <span class="anchor-badge">
      <slot name="anchor">
        {#if anchor}
          <AnchorBadge
            commit={project.head}
            head={project.head} noText noBg
            anchors={[anchor.anchor.stateHash]} />
        {/if}
      </slot>
    </span>
  </div>
</article>
