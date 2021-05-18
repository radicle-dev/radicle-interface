<script context="module" lang="typescript">
  export interface Field {
    name: string
    value: string | null
    label?: string
    placeholder?: string
    editable: boolean
  }
</script>

<script lang="typescript">
  import { createEventDispatcher } from 'svelte';
  import { link } from 'svelte-routing';
  import { capitalize, isUrl, isAddress } from '@app/utils';

  export let fields: Field[];
  export let editable = false;
  export let disabled = false;

  const dispatch = createEventDispatcher();
  const save = () => dispatch('save', fields);
  const cancel = () => dispatch('cancel');
</script>

<style>
  .fields {
    display: grid;
    grid-template-columns: auto auto;
    grid-gap: 1.5rem;
  }
  .fields > div {
    justify-self: start;
    align-self: center;
  }

  .field {
    width: 28rem;
    border: 1px dashed transparent;
    padding: 0.25rem 1rem;
    margin: 0;
  }

  input.field {
    border-radius: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  input.field::placeholder {
    color: var(--color-subtle);
    font-style: italic;
  }
  input.field:not([disabled])::placeholder {
    color: transparent;
  }
  input.field:not([disabled]) {
    border-color: var(--color-secondary) !important;
  }

  span.field {
    display: inline-block;
  }

  .label {
    border: 1px solid transparent;
  }

  .actions {
    margin-top: 2rem;
    text-align: center;
    visibility: hidden;
  }
  .actions button {
    margin-left: 1rem;
  }
  .actions.editable {
    visibility: visible;
  }
</style>

<div class="fields">
  {#each fields as field}
    <div class="label">
      {field.label || capitalize(field.name)}
    </div>
    <div>
      {#if field.value && (!field.editable || !editable || disabled)}
        <span class="field">
          {#if isUrl(field.value)}
            <a href="{field.value}" target="_blank">{field.value}</a>
          {:else if isAddress(field.value)}
            <a use:link href={`/resolve?q=${field.value}`} class="address">{field.value}</a>
          {:else}
            {field.value}
          {/if}
        </span>
      {:else}
        <input name={field.name} class="field" placeholder={field.placeholder}
               bind:value={field.value} type="text" />
      {/if}
    </div>
  {/each}
</div>

<div class="actions" class:editable>
  <button on:click={cancel} {disabled} class="small">
    Cancel
  </button>
  <button on:click={save} {disabled} class="small primary">
    Save
  </button>
</div>
