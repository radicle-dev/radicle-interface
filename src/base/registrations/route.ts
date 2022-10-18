export interface Params {
  nameOrDomain: string | null;
  activeView: string | null;
  owner: string | null;
}

export interface LoadedRoute {
  type: "registrations";
  activeView: string | null;
  nameOrDomain: string | null;
  owner: string | null;
}

export async function load(params: Params): Promise<LoadedRoute> {
  return {
    type: "registrations",
    activeView: params.activeView,
    nameOrDomain: params.nameOrDomain,
    owner: params.owner,
  };
}
