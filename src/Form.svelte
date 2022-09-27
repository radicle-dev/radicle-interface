<script context="module" lang="ts">
  export interface Field {
    name: string;
    value: string;
    label?: string;
    validate?: string;
    placeholder?: string;
    description: string;
    resolve?: boolean;
    editable: boolean;
    error?: string | null;
    example?: string;
    url?: string;
  }

  const validationExamples: Record<string, string> = {
    URL: "https://acme.xyz/",
    URN: "eip155:1:0xd1bb21bd5a432d2919c82bcefe1bc7f8cc9207d9",
    handle: "acme",
    id: "hydkkcf6k9be5fuszdhpqbctu3q3fuwagj874wx2puia8ti8coygh1",
    identity: "rad:git:hnrkqdpm9ub19oc8dccx44echy75hzfsezyio",
    domain: "seed.acme.xyz",
    address: "0x17a8c096733BD5F87aD43D7A2A4d1C42ab8A2A70",
  };

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
    identity: /^rad:git:[a-z0-9]{37}$/,
    domain: /^[^/:$!_;,@#]+\.[a-z]{2,}$/,
  };
</script>

<script lang="ts">
  import type { Config } from "@app/config";

  import cloneDeep from "lodash/cloneDeep";
  import { link } from "svelte-routing";
  import { createEventDispatcher } from "svelte";
  import { marked } from "marked";
  import {
    markdownExtensions as extensions,
    capitalize,
    isUrl,
    isAddress,
    formatSeedId,
  } from "@app/utils";

  import Address from "@app/Address.svelte";
  import Button from "@app/Button.svelte";
  import TextInput from "@app/TextInput.svelte";

  export let fields: Field[];
  export let editable = false;
  export let disabled = false;
  export let config: Config;

  let formFields = cloneDeep(fields);
  let hasErrors = false;

  marked.use({ extensions });

  const check = (event: Event) => {
    const name = (<HTMLInputElement>event.target).name;
    const value = (<HTMLInputElement>event.target).value;

    formFields = formFields.map(field => {
      if (field.name === name && field.validate) {
        hasErrors =
          value.length > 0
            ? !validationTypes[field.validate].test(value)
            : false;
        return {
          ...field,
          value: value,
          error: hasErrors ? `Must be a valid ${field.validate}` : undefined,
          example: validationExamples[field.validate],
        };
      }
      return field;
    });
  };

  const cleanup = (fields: Field[]): { name: string; value?: string }[] => {
    return fields
      .filter(field => field.editable)
      .map(field => {
        return {
          name: field.name,
          // We only allow to have a trueish value or an empty string.
          value: field.value ? field.value.trim() : "",
        };
      });
  };
  const dispatch = createEventDispatcher();
  const save = () => dispatch("save", cleanup(formFields));
  const validate = (event: Event) => dispatch("validate", check(event));
  const cancel = () => {
    formFields = cloneDeep(fields);
    dispatch("cancel");
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
    height: 2.5rem;
    border: 1px dashed transparent;
    padding: 0.25rem 1rem;
    margin: 0;
    white-space: nowrap;
  }
  .ellipsis {
    width: 28rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .description {
    padding-left: 1rem;
    max-width: 32rem;
  }
  .description :global(p) {
    padding: 0;
    margin: 0;
  }

  .description.invalid {
    color: var(--color-negative) !important;
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
    gap: 1.5rem;
    display: flex;
    justify-content: center;
  }
  .actions.editable {
    visibility: visible;
  }
  .text-input {
    width: 28rem;
  }
  @media (max-width: 720px) {
    .field {
      width: unset;
    }
    .text-input {
      width: 14rem;
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
        <div class="text-input">
          <TextInput
            variant="dashed"
            name={field.name}
            placeholder={field.placeholder}
            on:change={validate}
            on:input={() => (field.error = null)}
            bind:value={field.value}
            {disabled} />
        </div>
      {:else}
        <span class="field">
          {#if field.value}
            {#if isUrl(field.value)}
              <span class="ellipsis">
                <a class="link" href={field.value} target="_blank">
                  {field.value}
                </a>
              </span>
            {:else if isAddress(field.value)}
              <div class="desktop-inline">
                <Address
                  resolve={field.resolve ?? false}
                  address={field.value}
                  {config} />
              </div>
              <div class="mobile-inline">
                <Address
                  compact
                  resolve={field.resolve ?? false}
                  address={field.value}
                  {config} />
              </div>
            {:else if field.url}
              <div>
                <a class="link" use:link href={field.url}>{field.value}</a>
              </div>
            {:else if field.validate === "id"}
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
            <span class="txt-missing">&cross; Not set</span>
          {/if}
        </span>
      {/if}
      {#if field.error}
        <div class="description invalid txt-small faded">
          {#if field.example}
            {field.error}, eg.
            <em>{field.example}</em>
          {:else}
            {field.error}
          {/if}
        </div>
      {:else}
        <div class="description txt-small faded">
          {@html marked(field.description)}
        </div>
      {/if}
    </div>
  {/each}
</div>

<div class="actions" class:editable>
  <Button on:click={cancel} {disabled} variant="foreground">Cancel</Button>
  <Button on:click={save} disabled={hasErrors || disabled} variant="primary">
    Save
  </Button>
</div>
