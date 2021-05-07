<script context="module" lang="typescript">
  export interface Field {
    label: string,
    value: string | null,
    placeholder?: string,
    type: string,
    editable: boolean
  }
</script>

<script lang="typescript">
  import { createEventDispatcher } from 'svelte';

  export let fields: Field[];
  export let editable = false ;

  const dispatch = createEventDispatcher();
  const save = () => dispatch('save');
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

  input.field {
    padding: 0;
    margin: 0;
    border: none;
  }
  input.field {
    padding: 0.25rem 1rem;
    border-radius: 1rem;
    border: 1px dashed transparent;
    width: 28rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  input.field[disabled] {
    color: var(--color-foreground);
    font-style: normal;
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
      {field.label}
    </div>
    <div>
      <input class="field" placeholder={field.placeholder}
             disabled={!field.editable || !editable}
             type={field.type} value={field.value} />
    </div>
  {/each}
</div>

<div class="actions" class:editable>
  <button on:click={cancel} class="small">
    Cancel
  </button>
  <button on:click={save} class="small primary">
    Save
  </button>
</div>
