declare module "virtual:*" {
  const config: {
    nodes: {
      apiVersion: string;
      fallbackPublicExplorer: string;
      defaultHttpdPort: number;
      defaultHttpdHostname: string;
      defaultLocalHttpdPort: number;
      defaultNodePort: number;
      defaultHttpdScheme: string;
      pinned: { baseUrl: BaseUrl }[];
    };
    reactions: string[];
    supportWebsite: string;
    fallbackPreferredSeed: BaseUrl;
  };

  export default config;
}
