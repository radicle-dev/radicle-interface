import type { Embed } from "@http-client";

async function parseGitOid(bytes: Uint8Array): Promise<string> {
  // Create the header
  const header = new TextEncoder().encode(`blob ${bytes.length}\0`);

  // Concatenate the header and the original file content
  const combined = new Uint8Array(header.length + bytes.length);
  combined.set(header);
  combined.set(bytes, header.length);

  // Compute the SHA-1 hash
  const hashBuffer = await crypto.subtle.digest("SHA-1", combined);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // Convert the hash to a hexadecimal string
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function base64String(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target?.result && typeof event.target.result === "string") {
        resolve(event.target.result);
      } else {
        reject(new Error("Failed to generate base64 string"));
      }
    };

    reader.readAsDataURL(file);
  });
}

export function parseEmbedIntoMap(embeds: Embed[]) {
  return embeds.reduce((acc, embed) => {
    acc.set(embed.content.substring(4), embed);
    return acc;
  }, new Map());
}

const mimes: Record<string, string> = {
  "3gp": "video/3gpp",
  "7z": "application/x-7z-compressed",
  aac: "audio/aac",
  avi: "video/x-msvideo",
  bin: "application/octet-stream",
  bmp: "image/bmp",
  bz: "application/x-bzip",
  bz2: "application/x-bzip2",
  csh: "application/x-csh",
  css: "text/css",
  csv: "text/csv",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  epub: "application/epub+zip",
  gz: "application/gzip",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/vnd.microsoft.icon",
  jar: "application/java-archive",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript",
  json: "application/json",
  mjs: "text/javascript",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  mpeg: "video/mpeg",
  odp: "application/vnd.oasis.opendocument.presentation",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odt: "application/vnd.oasis.opendocument.text",
  oga: "audio/ogg",
  ogv: "video/ogg",
  ogx: "application/ogg",
  otf: "font/otf",
  png: "image/png",
  pdf: "application/pdf",
  php: "application/x-httpd-php",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  rar: "application/vnd.rar",
  rtf: "application/rtf",
  sh: "application/x-sh",
  svg: "image/svg+xml",
  tar: "application/x-tar",
  tif: "image/tiff",
  tiff: "image/tiff",
  ttf: "font/ttf",
  txt: "text/plain",
  wav: "audio/wav",
  weba: "audio/webm",
  webm: "video/webm",
  webp: "image/webp",
  woff: "font/woff",
  woff2: "font/woff2",
  xhtml: "application/xhtml+xml",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xml: "application/xml",
  zip: "application/zip",
};

async function embed(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const oid = await parseGitOid(bytes);
  const content = await base64String(file);
  return { oid, name: file.name, content };
}

export { embed, mimes };
