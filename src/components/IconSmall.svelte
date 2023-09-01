<script lang="ts">
  import { unreachable } from "@app/lib/utils";

  export let name:
    | "arrow-box-up-right"
    | "chat"
    | "checkmark"
    | "chevron-down"
    | "chevron-left-right"
    | "chevron-up"
    | "clipboard"
    | "cross"
    | "delegate"
    | "download"
    | "issue"
    | "network"
    | "patch";
</script>

<style>
  svg {
    display: flex;
    flex-shrink: 0;
  }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<svg
  role="img"
  on:click
  width="16"
  height="16"
  fill="currentColor"
  viewBox="0 0 16 16">
  {#if name === "arrow-box-up-right"}
    <path
      fill-rule="evenodd"
      d="M8 3a.5.5 0 000 1h3.293l-2 2H3.217C2.545 6 2 6.545 2 7.217v5.566C2 13.455 2.545 14 3.217 14h5.566C9.455 14 10 13.455 10 12.783V8.609a.522.522 0 10-1.043 0v4.174a.174.174 0 01-.174.174H3.217a.174.174 0 01-.174-.174V7.217c0-.096.078-.174.174-.174H8.25L6.146 9.146a.5.5 0 10.708.708L12 4.707V8a.5.5 0 001 0V3.5a.5.5 0 00-.5-.5H8z"
      clip-rule="evenodd">
    </path>
  {:else if name === "chat"}
    <path
      fill-rule="evenodd"
      d="M3.5 3a.5.5 0 00-.5.5v6a.5.5 0 00.5.5h5.35A6.5 6.5 0 0113 11.497V3.5a.5.5 0 00-.5-.5h-9zM2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v9.143a.5.5 0 01-.845.362l-.512-.488A5.5 5.5 0 008.85 11H3.5A1.5 1.5 0 012 9.5v-6z"
      clip-rule="evenodd">
    </path>
    <path
      fill-rule="evenodd"
      d="M4 5.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm0 2a.5.5 0 01.5-.5h4.75a.5.5 0 010 1H4.5a.5.5 0 01-.5-.5z"
      clip-rule="evenodd">
    </path>
  {:else if name === "checkmark"}
    <path
      fill-rule="evenodd"
      d="M11.748 4.066a.5.5 0 01.186.682l-3.35 5.863a1.5 1.5 0 01-2.363.317L4.146 8.854a.5.5 0 11.708-.707l2.074 2.074a.5.5 0 00.787-.106l3.35-5.863a.5.5 0 01.683-.186z"
      clip-rule="evenodd">
    </path>
  {:else if name === "chevron-down"}
    <path
      fill-rule="evenodd"
      d="M12.837 5.15a.49.49 0 010 .73L9.286 9.727a1.76 1.76 0 01-2.357 0L3.163 5.88a.489.489 0 010-.728.587.587 0 01.785 0L7.714 9A.587.587 0 008.5 9l3.552-3.85a.587.587 0 01.785 0z"
      clip-rule="evenodd">
    </path>
  {:else if name === "chevron-left-right"}
    <path
      fill-rule="evenodd"
      d="M6.104 3.646a.5.5 0 010 .708l-3.28 3.278a.167.167 0 00.001.236l3.279 3.278a.5.5 0 01-.708.708L2.118 8.575a1.167 1.167 0 010-1.65l3.278-3.279a.5.5 0 01.708 0zm3.792 0a.5.5 0 01.707 0l3.28 3.279a1.167 1.167 0 010 1.65l-3.28 3.279a.5.5 0 01-.707-.708l3.279-3.278a.167.167 0 000-.236L9.896 4.354a.5.5 0 010-.708z"
      clip-rule="evenodd">
    </path>
  {:else if name === "chevron-up"}
    <path
      fill-rule="evenodd"
      d="M3.163 9.85a.489.489 0 010-.73l3.496-3.667a1.76 1.76 0 012.357 0l3.821 3.668a.49.49 0 010 .728.587.587 0 01-.785 0L8.23 6.181a.587.587 0 00-.786 0L3.948 9.849a.587.587 0 01-.785 0z"
      clip-rule="evenodd">
    </path>
  {:else if name === "clipboard"}
    <path
      fill-rule="evenodd"
      d="M6 2.5A1.5 1.5 0 017.5 1h6A1.5 1.5 0 0115 2.5v6a1.5 1.5 0 01-1.5 1.5H10v3.5A1.5 1.5 0 018.5 15h-6A1.5 1.5 0 011 13.5v-6A1.5 1.5 0 012.5 6H6V2.5zM6 7H2.5a.5.5 0 00-.5.5v6a.5.5 0 00.5.5h6a.5.5 0 00.5-.5V10H7.5A1.5 1.5 0 016 8.5V7zm1.5 2a.5.5 0 01-.5-.5v-6a.5.5 0 01.5-.5h6a.5.5 0 01.5.5v6a.5.5 0 01-.5.5h-6z"
      clip-rule="evenodd">
    </path>
  {:else if name === "cross"}
    <path
      fill-rule="evenodd"
      d="M3.163 3.163a.556.556 0 01.785 0L8 7.214l4.052-4.051a.556.556 0 01.785.785L8.786 8l4.051 4.052a.556.556 0 01-.785.785L8 8.786l-4.052 4.051a.556.556 0 01-.785-.785L7.214 8 3.163 3.948a.556.556 0 010-.785z"
      clip-rule="evenodd">
    </path>
  {:else if name === "delegate"}
    <path
      fill-rule="evenodd"
      d="M3.5 5a1 1 0 110-2 1 1 0 010 2zm-2-1a2 2 0 104 0 2 2 0 00-4 0zM11.5 5a1 1 0 110-2 1 1 0 010 2zm-2-1a2 2 0 104 0 2 2 0 00-4 0z"
      clip-rule="evenodd">
    </path>
    <path
      fill-rule="evenodd"
      d="M3.5 5.333a.5.5 0 01.5.5V7.5a.5.5 0 00.5.5h6a.5.5 0 00.5-.5V5.833a.5.5 0 011 0V7.5A1.5 1.5 0 0110.5 9H8v2.833c0 .277-.224-.5-.5-.5s-.5.777-.5.5V9H4.5A1.5 1.5 0 013 7.5V5.833a.5.5 0 01.5-.5z"
      clip-rule="evenodd">
    </path>
    <path
      fill-rule="evenodd"
      d="M7.5 14a1 1 0 110-2 1 1 0 010 2zm-2-1a2 2 0 104 0 2 2 0 00-4 0z"
      clip-rule="evenodd">
    </path>
  {:else if name === "download"}
    <path
      fill-rule="evenodd"
      d="M3.5 8a.5.5 0 00-.5.5v4A1.5 1.5 0 004.5 14h8a1.5 1.5 0 001.5-1.5v-4a.5.5 0 00-1 0v4a.5.5 0 01-.5.5h-8a.5.5 0 01-.5-.5v-4a.5.5 0 00-.5-.5z"
      clip-rule="evenodd">
    </path>
    <path
      fill-rule="evenodd"
      d="M8.5 8.5A.5.5 0 009 8V3a.5.5 0 00-1 0v5a.5.5 0 00.5.5z"
      clip-rule="evenodd">
    </path>
    <path
      fill-rule="evenodd"
      d="M5.084 6.239a.48.48 0 01.693-.149l2.446 1.748c.168.12.386.12.554 0l2.446-1.748a.48.48 0 01.693.149.56.56 0 01-.139.743L9.332 8.73c-.504.36-1.16.36-1.664 0L5.223 6.982a.56.56 0 01-.139-.743z"
      clip-rule="evenodd">
    </path>
  {:else if name === "issue"}
    <path
      fill-rule="evenodd"
      d="M2 8a6 6 0 1112 0A6 6 0 012 8zm6-5.077a5.077 5.077 0 100 10.154A5.077 5.077 0 008 2.923z"
      clip-rule="evenodd">
    </path>
    <path
      fill-rule="evenodd"
      d="M7.077 8a.923.923 0 101.846 0 .923.923 0 00-1.846 0z"
      clip-rule="evenodd">
    </path>
  {:else if name === "network"}
    <path
      fill-rule="evenodd"
      d="M5.5 3a1 1 0 11-2 0 1 1 0 012 0zm1 0A2 2 0 015 4.937v2.126c.308.08.587.23.818.433L9.65 4.76A2 2 0 1112 5.937v5.126a2 2 0 11-2.42 1.375L5.95 10.38A2 2 0 114 7.063V4.937A2 2 0 116.5 3zm-.064 6.506l3.656 2.073c.248-.245.56-.426.908-.516V5.937a1.994 1.994 0 01-.751-.377L6.382 8.322a1.996 1.996 0 01.054 1.184zM3.5 9a1 1 0 112 0 1 1 0 01-2 0zm9-5a1 1 0 11-2 0 1 1 0 012 0zm-1 8a1 1 0 100 2 1 1 0 000-2z"
      clip-rule="evenodd">
    </path>
  {:else if name === "patch"}
    <path
      fill-rule="evenodd"
      d="M11.5 13a1 1 0 100-2 1 1 0 000 2zm0 1a2 2 0 100-4 2 2 0 000 4zM4.5 4c.276 0 .5.247.5.553v5.894c0 .306-.224.553-.5.553s-.5-.247-.5-.553V4.553C4 4.247 4.224 4 4.5 4zM9.565 3.146a.5.5 0 010 .708L7.92 5.5l1.646 1.646a.5.5 0 11-.707.708l-2-2a.5.5 0 010-.708l2-2a.5.5 0 01.707 0z"
      clip-rule="evenodd">
    </path>
    <path
      fill-rule="evenodd"
      d="M7.003 5.5a.5.5 0 00.5.5h3.32c.092 0 .166.075.166.167L11 10.32a.5.5 0 001 0l-.01-4.154c0-.645-.523-1.167-1.167-1.167h-3.32a.5.5 0 00-.5.5zM4.5 13a1 1 0 100-2 1 1 0 000 2zm0 1a2 2 0 100-4 2 2 0 000 4zM4.5 4a1 1 0 100-2 1 1 0 000 2zm0 1a2 2 0 100-4 2 2 0 000 4z"
      clip-rule="evenodd">
    </path>
  {:else}
    {unreachable(name)}
  {/if}
</svg>
