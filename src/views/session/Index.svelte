<script lang="ts">
  import type { SessionRoute } from "@app/lib/router/definitions";

  import { onMount } from "svelte";

  import * as modal from "@app/lib/modal";
  import * as router from "@app/lib/router";
  import * as httpd from "@app/lib/httpd";

  import AppLayout from "@app/App/AppLayout.svelte";
  import Loading from "@app/components/Loading.svelte";

  import AuthenticationErrorModal from "@app/modals/AuthenticationErrorModal.svelte";

  export let activeRoute: SessionRoute;

  onMount(async () => {
    const port = Number.parseInt(activeRoute.params.apiAddr.split(":")[1]);
    if (port > 0 && port < 2 ** 16) {
      httpd.changeHttpdPort(port);
    }
    const isAuthenticated = await httpd.authenticate(activeRoute.params);

    if (!isAuthenticated) {
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
