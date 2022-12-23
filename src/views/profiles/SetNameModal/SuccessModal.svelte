<script lang="ts" strictEvents>
  import * as utils from "@app/lib/utils";
  import Modal from "@app/components/Modal.svelte";

  export let address: string;
  export let name: string;
  export let domain: string;
</script>

<Modal emoji="✅" title="Associate profile" closeAction={{ name: "Done" }}>
  <div slot="subtitle" style:margin-bottom="1rem">
    The ENS name for {utils.formatAddress(address)}
    <br />
    was set to
    <span class="txt-bold">{name}.{domain}</span>
  </div>
</Modal>
