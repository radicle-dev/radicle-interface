<script lang="ts">
  import type { Route } from "@app/lib/router/definitions";

  import { onMount } from "svelte";

  import * as modal from "@app/lib/modal";
  import * as router from "@app/lib/router";
  import * as session from "@app/lib/session";
  import Loading from "@app/components/Loading.svelte";

  import AuthenticatedModal from "@app/views/session/AuthenticatedModal.svelte";
  import AuthenticationErrorModal from "@app/views/session/AuthenticationErrorModal.svelte";

  export let activeRoute: Extract<Route, { resource: "session" }>;

  onMount(async () => {
    const status = await session.authenticate(activeRoute.params);

    if (status === "success") {
      modal.show({ component: AuthenticatedModal, props: {} });
    } else {
      modal.show({
        component: AuthenticationErrorModal,
        props: {
          title: "Authentication failed",
          subtitle: [
            "There was an error while authenticating.",
            "Check your radicle-httpd logs for details.",
          ],
        },
      });
    }

    router.push({ resource: "home" });
  });
</script>

<Loading center />
