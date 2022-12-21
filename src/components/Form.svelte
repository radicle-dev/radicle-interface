<script context="module" lang="ts">
  export interface RegistrationRecord {
    name: string;
    value: string;
  }

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

<script lang="ts" strictEvents>
  import type { Wallet } from "@app/lib/wallet";

  import cloneDeep from "lodash/cloneDeep";
  import { createEventDispatcher } from "svelte";
  import { marked } from "marked";
  import {
    markdownExtensions as extensions,
    capitalize,
    isUrl,
    isAddress,
    formatSeedId,
  } from "@app/lib/utils";

  import Address from "@app/components/Address.svelte";
  import Button from "@app/components/Button.svelte";
  import TextInput from "@app/components/TextInput.svelte";

  export let fields: Field[];
  export let editable = false;
  export let disabled = false;
  export let wallet: Wallet;

  let formFields = cloneDeep(fields);
  let hasErrors = false;

  marked.use({ extensions });

  const check = (event: Event): void => {
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

  const cleanup = (fields: Field[]): RegistrationRecord[] => {
    return fields
      .filter(field => field.editable)
      .map(field => {
        return {
          name: field.name,
          value: field.value ? field.value.trim() : "",
        };
      });
  };
  const dispatch = createEventDispatcher<{
    save: RegistrationRecord[];
    validate: never;
    cancel: never;
  }>();
  const save = () => dispatch("save", cleanup(formFields));
  function validate(event: Event) {
    check(event);
    dispatch("validate");
  }
  const cancel = () => {
    formFields = cloneDeep(fields);
    dispatch("cancel");
  };
</script>

<style>
  .fields {
    display: grid;
    grid-template-columns: 6rem auto;
    gap: 1rem 1.5rem;
  }
  .fields > div {
    place-self: center start;
  }

  .field {
    display: flex;
    align-items: flex-start;
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
    color: var(--color-negative);
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
    <div class="label txt-highlight">
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
                <a
                  href={field.value}
                  class="txt-link"
                  target="_blank"
                  rel="noreferrer">
                  {field.value}
                </a>
              </span>
            {:else if isAddress(field.value)}
              <div class="layout-desktop-inline">
                <Address
                  resolve={field.resolve ?? false}
                  address={field.value}
                  {wallet} />
              </div>
              <div class="layout-mobile-inline">
                <Address
                  compact
                  resolve={field.resolve ?? false}
                  address={field.value}
                  {wallet} />
              </div>
            {:else if field.url}
              <div>
                <a href={field.url} class="txt-link">{field.value}</a>
              </div>
            {:else if field.validate === "id"}
              <div class="layout-mobile">
                {formatSeedId(field.value)}
              </div>
              <div class="layout-desktop">
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
        <div class="description txt-faded txt-small invalid">
          {#if field.example}
            {field.error}, eg.
            <em>{field.example}</em>
          {:else}
            {field.error}
          {/if}
        </div>
      {:else}
        <div class="description txt-faded txt-small">
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
