<script lang="ts">
  import type { Route } from "@app/lib/router/definitions";

  import { onMount } from "svelte";

  import * as modal from "@app/lib/modal";
  import * as router from "@app/lib/router";
  import * as httpd from "@app/lib/httpd";
  import Loading from "@app/components/Loading.svelte";

  import AuthenticatedModal from "@app/modals/AuthenticatedModal.svelte";
  import AuthenticationErrorModal from "@app/modals/AuthenticationErrorModal.svelte";

  export let activeRoute: Extract<Route, { resource: "session" }>;

  onMount(async () => {
    const isAuthenticated = await httpd.authenticate(activeRoute.params);

    if (isAuthenticated) {
      modal.show({ component: AuthenticatedModal, props: {} });
      void router.push({
        resource: "nodes",
        params: {
          baseUrl: httpd.api.baseUrl,
          projectPageIndex: 0,
        },
      });
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
      void router.push({ resource: "home" });
    }
  });
</script>

<Loading center />
