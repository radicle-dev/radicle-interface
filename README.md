# Radicle Explorer

This user interface lets you interact with [Radicle][rad], a peer-to-peer code
collaboration and publishing stack, directly from your web browser.

**Deployment Options:**

* **Public Server:** The Radicle team maintains a public instance at [app.radicle.xyz][app]
* **Local-first:** Run the UI locally
* **Self-hosting:** Deploy the UI on your own server


## Local-first

**Prerequisites:**

* Recent versions of [Node.js][nod] (20.9.0 or higher) and [npm][npm] installed

Run the following commands to access the web UI locally:

``` shell
git clone https://seed.radicle.xyz/z4V1sjrXqjvFdnCUbxPFqd5p4DtH5.git radicle-explorer
cd radicle-explorer
npm install
npm start
```

Then open http://localhost:3000 in your favourite browser.


## Self-Hosting the UI

There are several ways to deploy the UI publicly. Here are two common options:

**Using your own web server:**

1. Run `npm install && npm build` to create a build for deployment
2. Configure your web server to serve the contents of the `/build` directory

**Using Vercel (or similar static file hosting):**

1. Fork this repository to create your own version
2. Configure your Vercel account to deploy the forked repository

## Configuration

There's two ways to configure the UI:

**Create a `local.json` config file**

1. Copy [default.json][def] to a new file in the same folder called
   `local.json`.
2. Modify the properties in `local.json` to your preference.

**Environment variables**

1. Check [custom-environment-variables.json][env] for all available environment
   variables.
2. Set the desired environment variables when building the UI.

> For advanced configuration options, have a look at the [`node-config`][nco]
> package.

## Contributing

* For detailed contribution guidelines, refer to the [CONTRIBUTING.md][con]
  file
* To propose changes, open an [issue][iss] or submit a [patch][pat] using
  Radicle


## Getting in touch

To get in touch with the maintainers, sign up to our
[official chat on Zulip][zul].


## License

The UI is distributed under the terms of GPLv3. See [LICENSE][lic] for details.



[app]: https://app.radicle.xyz
[con]: ./CONTRIBUTING.md
[def]: ./config/default.json
[env]: ./config/custom-environment-variables.json
[iss]: https://app.radicle.xyz/nodes/seed.radicle.garden/rad:z4V1sjrXqjvFdnCUbxPFqd5p4DtH5/issues
[lic]: ./LICENSE
[nco]: https://github.com/node-config/node-config/wiki/Configuration-Files
[nod]: https://nodejs.org
[npm]: https://www.npmjs.com
[pat]: https://app.radicle.xyz/nodes/seed.radicle.garden/rad:z4V1sjrXqjvFdnCUbxPFqd5p4DtH5/patches
[rad]: https://radicle.xyz
[zul]: https://radicle.zulipchat.com/#narrow/stream/369278-web
