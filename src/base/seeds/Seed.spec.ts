import { Seed } from "./Seed";
import { Config } from "@app/config";

describe('Seed', function () {
  it("Constructs git host correctly", () => {
    const cfg = new Config({ name: "homestead", chainId: 1 }, null as any, null);
    const seed = new Seed({
      host: "seed.cloudhead.io",
      id: "hydzjm73tstmdcwhach3psfgkunbjpih7ztnuswhw9w6h9pi5sffd6",
      git: "git.seed.cloudhead.io",
    }, cfg);

    expect(seed.git.host).to.eq("git.seed.cloudhead.io");
    expect(seed.git.port).to.eq(443);

    expect(seed.host).to.eq("seed.cloudhead.io");
    expect(seed.api.host).to.eq(seed.host);
    expect(seed.api.port).to.eq(8777);
  });

  it("Constructs git host correctly with custom port", () => {
    const cfg = new Config({ name: "homestead", chainId: 1 }, null as any, null);
    const seed = new Seed({
      host: "seed.cloudhead.io",
      id: "hydzjm73tstmdcwhach3psfgkunbjpih7ztnuswhw9w6h9pi5sffd6",
      git: "https://git.seed.cloudhead.io:8778",
    }, cfg);

    expect(seed.git.host).to.eq("git.seed.cloudhead.io");
    expect(seed.git.port).to.eq(8778);
  });

  it("Constructs api host correctly", () => {
    const cfg = new Config({ name: "homestead", chainId: 1 }, null as any, null);
    const seed = new Seed({
      host: "seed.cloudhead.io",
      id: "hydzjm73tstmdcwhach3psfgkunbjpih7ztnuswhw9w6h9pi5sffd6",
      api: "https://api.seed.cloudhead.io:8080",
    }, cfg);

    expect(seed.api.host).to.eq("api.seed.cloudhead.io");
    expect(seed.api.port).to.eq(8080);

    expect(seed.host).to.eq("api.seed.cloudhead.io");
    expect(seed.git.host).to.eq("seed.cloudhead.io");
    expect(seed.git.port).to.eq(443);
  });
});
