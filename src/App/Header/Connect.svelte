<script lang="ts">
  import debounce from "lodash/debounce";

  import { closeFocused } from "@app/components/Floating.svelte";
  import { sessionStore, disconnect } from "@app/lib/session";
  import { toClipboard, formatNodeId } from "@app/lib/utils";

  import Avatar from "@app/components/Avatar.svelte";
  import Button from "@app/components/Button.svelte";
  import Floating from "@app/components/Floating.svelte";
  import Icon from "@app/components/Icon.svelte";

  let icon: "clipboard-small" | "checkmark-small" = "clipboard-small";

  const restoreIcon = debounce(() => {
    icon = "clipboard-small";
  }, 800);

  async function copyToClipboard(clipboard: string): Promise<void> {
    await toClipboard(clipboard);
    icon = "checkmark-small";
    restoreIcon();
  }

  $: command = import.meta.env.PROD
    ? "rad web"
    : `rad web --frontend ${new URL(import.meta.url).origin}`;
</script>

<style>
  .dropdown {
    align-items: center;
    background: var(--color-background-1);
    border-radius: var(--border-radius);
    box-shadow: var(--elevation-low);
    color: var(--color-foreground-6);
    display: flex;
    flex-direction: column;
    position: absolute;
    right: 5rem;
    top: 5rem;
    width: 15rem;
  }
  .info {
    align-items: flex-start;
    padding: 1rem;
    width: 20.5rem;
  }
  .cmd {
    background-color: var(--color-foreground-3);
    border-radius: var(--border-radius-small);
    cursor: pointer;
    display: inline-block;
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-small);
    margin-top: 0.5rem;
    max-width: 18.5rem;
    overflow: hidden;
    padding: 2px 0.5rem;
    position: relative;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cmd-clipboard {
    align-items: center;
    background-image: linear-gradient(
      -90deg,
      var(--color-foreground-2),
      var(--color-foreground-2),
      transparent
    );
    display: flex;
    justify-content: flex-end;
    position: absolute;
    right: 0;
    top: 0;
    visibility: hidden;
    width: 3rem;
    height: 100%;
  }
  .cmd:hover .cmd-clipboard {
    visibility: visible;
  }
  .avatar-id-container {
    align-items: center;
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2rem 1rem;
    width: 100%;
  }
  .id-container {
    align-items: center;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    justify-content: center;
  }
  .id-container:hover {
    color: var(--color-foreground);
  }
  .id-container:hover .id-clipboard {
    visibility: visible;
  }
  .id-clipboard {
    position: absolute;
    right: 1rem;
    visibility: hidden;
  }
  .id {
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-tiny);
    user-select: none;
    word-break: break-all;
  }
  .disconnect {
    align-items: center;
    border-top: 1px solid var(--color-foreground-3);
    cursor: pointer;
    display: flex;
    flex-direction: row;
    font-weight: 600;
    height: 2.5rem;
    justify-content: space-between;
    line-height: 2.5rem;
    padding: 0 0.8rem;
    user-select: none;
    width: 100%;
  }
  .disconnect:hover {
    background-color: var(--color-foreground-3);
    border-bottom-left-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
    color: var(--color-foreground-6);
  }
  .toggle-avatar {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  }
  .dropdown-avatar {
    align-items: center;
    display: flex;
    height: 80px;
    justify-content: center;
    margin-bottom: 1rem;
  }
</style>

<Floating>
  <div slot="toggle">
    <Button
      style={$sessionStore
        ? "padding-left: 10px; padding-right: 1rem;"
        : undefined}
      variant="foreground">
      {#if $sessionStore}
        <div class="toggle-avatar">
          <div style:height="1.5rem">
            <Avatar nodeId={$sessionStore.publicKey} />
          </div>
          <div class="user-id txt-small">
            {formatNodeId($sessionStore.publicKey)}
          </div>
        </div>
      {:else}
        Connect
      {/if}
    </Button>
  </div>

  <div slot="modal">
    {#if !$sessionStore}
      <div class="dropdown info">
        To connect to your local Radicle node, run this command in your
        terminal:
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span
          class="cmd"
          on:click={async () => {
            await copyToClipboard(command);
          }}>
          {command}
          <div class="cmd-clipboard">
            <Icon name={icon} />
          </div>
        </span>
      </div>
    {:else}
      <div class="dropdown">
        <div class="avatar-id-container">
          <div class="dropdown-avatar">
            <Avatar nodeId={$sessionStore.publicKey} />
          </div>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            class="id-container"
            on:click={async () => {
              if ($sessionStore) {
                await copyToClipboard($sessionStore.publicKey);
              }
            }}>
            <div class="id">
              {formatNodeId($sessionStore.publicKey)}
            </div>
            <div class="id-clipboard">
              <Icon name={icon} />
            </div>
          </div>
        </div>

        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          class="disconnect"
          on:click={() => {
            void disconnect();
            closeFocused();
          }}>
          Disconnect
        </div>
      </div>
    {/if}
  </div>
</Floating>
