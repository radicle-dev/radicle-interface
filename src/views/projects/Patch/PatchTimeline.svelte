<script lang="ts">
  import type { Blob, Project } from "@app/lib/project";

  import Authorship from "@app/components/Authorship.svelte";
  import Comment from "@app/components/Comment.svelte";
  import Review from "@app/views/projects/Patch/Review.svelte";
  import { Patch, TimelineType } from "@app/lib/patch";
  import { canonicalize } from "@app/lib/utils";
  import { formatSeedId } from "@app/lib/utils";

  export let patch: Patch;
  export let revisionNumber: number;
  export let project: Project;

  $: timeline = patch.createTimeline(revisionNumber);

  // Get an image blob based on a relative path.
  const getImage = async (imagePath: string): Promise<Blob> => {
    const finalPath = canonicalize(imagePath, "/"); // We only use the root path in issues.
    const commit = project.branches[project.defaultBranch]; // We suppose that all issues are only looked at on HEAD of the default branch.
    return project.getBlob(commit, finalPath);
  };
</script>

<style>
  .timeline {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .replies {
    margin-left: 2rem;
  }
  .element {
    margin: 0 0 1rem 3rem;
  }
</style>

<div class="timeline">
  {#each timeline as element}
    {#if element.type === TimelineType.Merge && element.inner.peer.person}
      <div class="element">
        <Authorship
          author={{
            peer: element.inner.peer.id,
            id: element.inner.peer.person.id,
            profile: element.inner.peer.person,
          }}
          caption={`merged to ${formatSeedId(element.inner.peer.id)}`}
          timestamp={element.timestamp} />
      </div>
    {:else if element.type === TimelineType.Review && element.inner.author.profile?.ens?.name}
      <div class="margin-left">
        <Review review={element.inner} {getImage} />
      </div>
    {:else if element.type === TimelineType.Comment}
      <div class="margin-left">
        <!-- Since the element variable only experiences changes on the inner property,
        this component has to be forced to be rerendered when element.inner changes -->
        {#key element.inner}
          <Comment comment={element.inner} {getImage} />
        {/key}
      </div>
    {:else if element.type === TimelineType.Thread}
      <div class="margin-left">
        <Comment comment={element.inner} {getImage} />
        {#if !window.HEARTWOOD}
          <div class="replies">
            {#each element.inner.replies as comment}
              <Comment caption="replied" {comment} {getImage} />
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  {/each}
</div>
