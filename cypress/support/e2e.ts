declare global {
  interface Window {
    ethereum: any;
    localStorage: Storage;
  }
}

function getPath(location: Location): string {
  const url = location.href.replace(window.origin, "");
  return process.env.hashRouting ? url.substring(2) : url;
}

export { getPath };
