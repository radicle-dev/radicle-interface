declare module "virtual:*" {
  const config: {
    nodes: {
      apiVersion: string;
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
    fallbackPreferredSeed: BaseUrl;
  };

  export default config;
}
