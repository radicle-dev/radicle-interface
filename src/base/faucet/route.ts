export type Params = { activeView: string; amount: string | null };

export interface LoadedRoute {
  type: "faucet";
  activeView: string;
  amount: string;
}

export async function load(params: Params): Promise<LoadedRoute> {
  return {
    type: "faucet",
    activeView: params.activeView,
    amount: params.amount || "0",
  };
}
