import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Pages serves static files, so Next server headers/nonces cannot protect this export.
// Hash the exact inline hydration scripts per document instead of allowing arbitrary inline JS.
export function contentPolicy(html) {
  const hashes = new Set();
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!/\bsrc\s*=/i.test(match[1]) && match[2]) {
      hashes.add(`'sha256-${createHash('sha256').update(match[2]).digest('base64')}'`);
    }
  }
  return [
    "default-src 'self'",
    `script-src 'self' 'wasm-unsafe-eval' ${[...hashes].join(' ')}`,
    // Inline styles are required by Framer Motion, GSAP and the WebGL overlays.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' blob:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-src 'none'",
    "form-action 'none'",
  ].join('; ');
}
export function secureHtml(html) {
  html = html.replace(/<meta\s+data-export-csp="true"[^>]*>/gi, '');
  const policy = contentPolicy(html).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  if (!/<head>/i.test(html)) throw new Error('Export document has no head');
  return html.replace(/<head>/i, `<head><meta data-export-csp="true" http-equiv="Content-Security-Policy" content="${policy}">`);
}
async function secureDirectory(directory) {
  let count = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) count += await secureDirectory(path);
    else if (entry.name.endsWith('.html')) {
      await writeFile(path, secureHtml(await readFile(path, 'utf8')));
      count++;
    }
  }
  return count;
}
if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  console.log(`Added hash-based CSP to ${await secureDirectory('out')} exported HTML documents.`);
}
