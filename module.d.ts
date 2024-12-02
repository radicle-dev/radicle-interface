declare module "virtual:*" {
  const config: {
    nodes: {
      requiredApiVersion: string;
      fallbackPublicExplorer: string;
      defaultHttpdPort: number;
      defaultLocalHttpdPort: number;
      defaultHttpdScheme: string;
    };
    source: {
      commitsPerPage: number;
    };
    reactions: string[];
    supportWebsite: string;
    preferredSeeds: BaseUrl[];
  };

  export default config;
}
