<script lang="ts">
  import type { SessionRoute } from "@app/lib/router/definitions";

  import { onMount } from "svelte";

  import * as httpd from "@app/lib/httpd";
  import * as modal from "@app/lib/modal";
  import * as router from "@app/lib/router";
  import { experimental } from "@app/lib/appearance";

  import AppLayout from "@app/App/AppLayout.svelte";
  import Loading from "@app/components/Loading.svelte";

  import AuthenticationErrorModal from "@app/modals/AuthenticationErrorModal.svelte";
  import ErrorModal from "@app/modals/ErrorModal.svelte";

  export let activeRoute: SessionRoute;

  onMount(async () => {
    const port = Number.parseInt(activeRoute.params.apiAddr.split(":")[1]);
    if (port > 0 && port < 2 ** 16) {
      httpd.changeHttpdPort(port);
    }
    const isAuthenticated = await httpd.authenticate(activeRoute.params);

    if (!isAuthenticated && !$experimental) {
      modal.show({
        component: ErrorModal,
        props: {
          title: "Authentication failed",
          subtitle: [
            "Authentication only works in experimental mode.",
            "Go to Settings, set experimental mode to On and try again.",
          ],
          error: {
            message: "Can't authenticate in read-only mode.",
            stack: undefined,
          },
        },
      });
    } else if (!isAuthenticated) {
      modal.show({
        component: AuthenticationErrorModal,
        props: {},
      });
    }

    void router.navigateToUrl(
      "push",
      new URL(activeRoute.params.path || "", window.location.origin),
    );
  });
</script>

<AppLayout>
  <Loading center />
</AppLayout>
