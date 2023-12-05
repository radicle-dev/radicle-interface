<script lang="ts">
  import type { Route } from "@app/lib/router/definitions";

  import { onMount } from "svelte";

  import * as modal from "@app/lib/modal";
  import * as router from "@app/lib/router";
  import * as httpd from "@app/lib/httpd";

  import AppLayout from "@app/App/AppLayout.svelte";
  import Loading from "@app/components/Loading.svelte";

  import AuthenticationErrorModal from "@app/modals/AuthenticationErrorModal.svelte";

  export let activeRoute: Extract<Route, { resource: "session" }>;

  onMount(async () => {
    const port = Number.parseInt(activeRoute.params.apiAddr.split(":")[1]);
    if (port > 0 && port < 2 ** 16) {
      httpd.changeHttpdPort(port);
    }
    const isAuthenticated = await httpd.authenticate(activeRoute.params);

    if (isAuthenticated) {
      // TODO: Show toast.
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
    void router.push({ resource: "home" });
  });
</script>

<AppLayout>
  <Loading center />
</AppLayout>
