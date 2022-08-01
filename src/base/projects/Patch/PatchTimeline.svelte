<script lang="ts">
  import type { Config } from "@app/config";
  import { type Patch, TimelineType } from "@app/patch";
  import { formatSeedId } from "@app/utils";
  import { canonicalize } from "@app/utils";
  import Comment from "@app/Comment.svelte";
  import type { Blob, Project } from "@app/project";
  import Authorship from "@app/Authorship.svelte";
  import Review from "@app/Review.svelte";

  export let patch: Patch;
  export let revisionNumber: number;
  export let config: Config;
  export let project: Project;

  $: timeline = patch.createTimeline(revisionNumber);

  // Get an image blob based on a relative path.
  const getImage = async (imagePath: string): Promise<Blob> => {
    const finalPath = canonicalize(imagePath, "/"); // We only use the root path in issues.
    const commit = project.branches[project.defaultBranch]; // We suppose that all issues are only looked at on HEAD of the default branch.
    return project.getBlob(commit, finalPath, { highlight: false });
  };
</script>

<style>
  section {
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

<section>
  {#each timeline as element}
    {#if element.type === TimelineType.Merge && element.inner.peer.person}
      <div class="element">
        <Authorship
          author={{
            peer: element.inner.peer.id,
            urn: element.inner.peer.person.urn,
            profile: element.inner.peer.person,
          }}
          caption={`merged to ${formatSeedId(element.inner.peer.id)}`}
          timestamp={element.timestamp}
          {config} />
      </div>
    {:else if element.type === TimelineType.Review && element.inner.author.profile?.ens?.name}
      <div class="margin-left">
        <Review review={element.inner} {config} {getImage} />
      </div>
    {:else if element.type === TimelineType.Comment}
      <div class="margin-left">
        <!-- Since the element variable only experiences changes on the inner property,
        this component has to be forced to be rerendered when element.inner changes -->
        {#key element.inner}
          <Comment comment={element.inner} {config} {getImage} />
        {/key}
      </div>
    {:else if element.type === TimelineType.Thread}
      <div class="margin-left">
        <Comment comment={element.inner} {config} {getImage} />
        <div class="replies">
          {#each element.inner.replies as comment}
            <Comment caption="replied" {comment} {config} {getImage} />
          {/each}
        </div>
      </div>
    {/if}
  {/each}
</section>
