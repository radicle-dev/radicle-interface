# Radicle Web UI

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
```
git clone https://seed.radicle.garden/z4V1sjrXqjvFdnCUbxPFqd5p4DtH5.git radicle-interface
cd radicle-interface
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
[iss]: https://app.radicle.xyz/nodes/seed.radicle.garden/rad:z4V1sjrXqjvFdnCUbxPFqd5p4DtH5/issues
[lic]: ./LICENSE
[nod]: https://nodejs.org
[npm]: https://www.npmjs.com
[pat]: https://app.radicle.xyz/nodes/seed.radicle.garden/rad:z4V1sjrXqjvFdnCUbxPFqd5p4DtH5/patches
[rad]: https://radicle.xyz
[zul]: https://radicle.zulipchat.com/#narrow/stream/369278-web
