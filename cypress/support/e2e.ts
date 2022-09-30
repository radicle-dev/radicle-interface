declare global {
  interface Window {
    ethereum: any;
    localStorage: Storage;
  }
}

export {};
