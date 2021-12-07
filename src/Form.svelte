<script context="module" lang="ts">
  export interface Field {
    name: string;
    value?: string;
    label?: string;
    validate?: string;
    placeholder?: string;
    description: string;
    resolve?: boolean;
    editable: boolean;
    error?: string;
  }

  const validationTypes: { [index: string]: RegExp } = {
    URL: /^(https:\/\/|http:\/\/|ipfs:\/\/)\S+/,
    URN: /^[a-z]+:[a-zA-Z0-9:-]{1,64}$/,
    // Github
    //   Username may only contain alphanumeric characters or hyphens.
    //   Username cannot have multiple consecutive hyphens.
    //   Username cannot begin or end with a hyphen.
    //   Maximum is 39 characters.
    // Twitter
    //   Username may only contain alphanumeric characters or underscores.
    //   Maximum is 15 characters.
    // For simplification of the regex pattern we use a combined version of both requirements.
    handle: /^[a-zA-Z0-9-_]{1,39}$/,
    address: /^0x[a-zA-Z0-9]{40}$/,
    id: /^[a-z0-9]+$/,
    // Just make sure there is a TLD at the end.
    domain: /\.[a-z]{2,}$/,
  };
</script>

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import marked from 'marked';
  import { capitalize, isUrl, isAddress, formatSeedId } from '@app/utils';
  import Address from '@app/Address.svelte';
  import type { Config } from '@app/config';
  import Icon from "@app/Icon.svelte";

  export let fields: Field[];
  export let editable = false;
  export let disabled = false;
  export let config: Config;

  let formFields = fields;
  let hasErrors = false;

  const check = (event: Event) => {
    const name = (<HTMLInputElement>event.target).name;
    const value = (<HTMLInputElement>event.target).value;

    formFields = formFields.map(field => {
      if (field.name === name && field.validate) {
        hasErrors = value.length > 0 ? !validationTypes[field.validate].test(value) : false;
        return { ...field,
          value: value,
          error: hasErrors ? `Must be a valid ${field.validate}` : undefined
        };
      }
      return field;
    });
  };

  const cleanup = (fields: Field[]): { name: string; value?: string }[] => {
    return fields.filter(field => field.editable).map(field => {
      return {
        name: field.name,
        value: field.value && field.value.trim(),
      };
    });
  };
  const dispatch = createEventDispatcher();
  const save = () => dispatch('save', cleanup(formFields));
  const validate = (event: Event) => dispatch('validate', check(event));
  const cancel = () => {
    formFields = fields;
    dispatch('cancel');
  };
</script>

<style>
  .fields {
    display: grid;
    grid-template-columns: 6rem auto;
    grid-gap: 1rem 1.5rem;
  }
  .fields > div {
    justify-self: start;
    align-self: center;
  }

  .field {
    display: flex;
    align-items: center;
    width: 28rem;
    height: 2.125rem;
    border: 1px dashed transparent;
    padding: 0.25rem 1rem;
    margin: 0;
    white-space: nowrap;
  }

  .description {
    padding-left: 1rem;
    max-width: 32rem;
  }
  .description :global(p) {
    padding: 0;
    margin: 0;
  }

  input.field {
    border-radius: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    border-color: var(--color-secondary) !important;
  }
  .description.invalid {
    color: var(--color-negative) !important;
  }
  input.field::placeholder {
    color: var(--color-secondary);
    font-style: italic;
  }
  input.field[disabled] {
    color: var(--color-secondary);
  }

  .label {
    border: 1px solid transparent;
    padding: 0.25rem;
    height: 100%;
    display: block;
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
  @media (max-width: 720px) {
    .field {
      width: unset;
    }
  }
</style>

<div class="fields">
  {#each formFields as field}
    <div class="label">
      {field.label || capitalize(field.name)}
    </div>
    <div>
      {#if field.editable && editable}
        <input name={field.name} class="field" placeholder={field.placeholder}
               on:change={validate} value={field.value} type="text" {disabled} />
      {:else}
        <span class="field">
          {#if field.value}
            {#if isUrl(field.value)}
              <span class="desktop">
                <a class="link" href="{field.value}" target="_blank">{field.value}</a>
              </span>
              <span class="mobile" title={field.value}>
                <Icon name="url" />
              </span>
            {:else if isAddress(field.value)}
              <div class="desktop">
                <Address resolve={field.resolve ?? false} address={field.value} {config} />
              </div>
              <div class="mobile">
                <Address compact resolve={field.resolve ?? false} address={field.value} {config} />
              </div>
            {:else if (field.label === "Seed ID")}
              <div class="mobile">
                {formatSeedId(field.value)}
              </div>
              <div class="desktop">
                {field.value}
              </div>
            {:else}
              {field.value}
            {/if}
          {:else}
            <span class="subtle not-set">&cross; Not set</span>
          {/if}
        </span>
      {/if}
      {#if field.error}
        <div class="description invalid text-small faded">
          {field.error}
        </div>
      {:else}
        <div class="description text-small faded">
          {@html marked(field.description)}
        </div>
      {/if}
    </div>
  {/each}
</div>

<div class="actions" class:editable>
  <button on:click={cancel} {disabled} class="small">
    Cancel
  </button>
  <button on:click={save} disabled={hasErrors || disabled} class="small primary">
    Save
  </button>
</div>
