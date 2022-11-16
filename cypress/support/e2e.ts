function getPath(location: Location): string {
  const url = location.href.replace(window.origin, "");
  return window.HASH_ROUTING ? url.substring(2) : url;
}

export { getPath };
