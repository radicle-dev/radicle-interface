<script type="typescript">
  import type { Project } from './Project';

  export let project: Project;
</script>

<style>
  article {
    padding: 1rem;
    border: 1px solid var(--color-secondary);
  }
  article .id {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  article .anchor {
    color: var(--color-secondary);
    font-size: 0.75rem;
    font-family: var(--font-family-monospace);
  }
</style>

<article>
  <div class="id">{project.id}</div>
  <div class="anchor">commit {project.stateHash}</div>
</article>
