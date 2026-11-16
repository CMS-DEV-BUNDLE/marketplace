#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const ID_RE = /^[a-z0-9-]{2,32}$/;

const [idArg, nameArg, descArg] = process.argv.slice(2);

if (!idArg) {
  console.error('Usage: node skills/create-miniapp/scripts/create.mjs <app-id> [App Name] [Description]');
  process.exit(1);
}

const id = idArg.trim().toLowerCase();
if (!ID_RE.test(id)) {
  console.error(`Invalid app ID "${id}". Must be 2-32 chars, lowercase letters, digits, and hyphens only.`);
  process.exit(1);
}

const name = nameArg ? nameArg.trim() : id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
const description = descArg ? descArg.trim() : `${name} mini app`;

const appDir = resolve(join('apps', id));

const manifest = {
  id,
  name,
  version: '1.0.0',
  description,
  icon: 'icon.svg',
  entry: 'index.html',
  permissions: [],
  tabs: { allowMultiple: true, allowDuplicates: true },
  window: { minWidth: 720, minHeight: 480 }
};

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <style>
    :root { color: #1B1F1D; }
    @media (prefers-color-scheme: dark) { :root { color: #E6E9E6; } }
  </style>
  <rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect>
  <path d="M9 9h6v6H9z"></path>
</svg>`;

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${name}</title>
  <style>
    :root {
      --bg: #F6F7F5;
      --surface: #FFFFFF;
      --surface-2: #EEF0ED;
      --ink: #1B1F1D;
      --muted: #5E6861;
      --line: #DFE3DF;
      --accent: #0F6E66;
      --accent-ink: #FFFFFF;
    }
    :root[data-theme="dark"] {
      --bg: #121413;
      --surface: #1A1D1B;
      --surface-2: #222623;
      --ink: #E6E9E6;
      --muted: #8B948D;
      --line: #2A2F2C;
      --accent: #4FB8AD;
      --accent-ink: #0B1412;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--ink);
    }
    main {
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 16px 20px 32px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 20px;
    }
    h1 { font-size: 18px; margin-bottom: 8px; }
    p { font-size: 14px; color: var(--muted); margin-bottom: 16px; }
    button {
      background: var(--accent);
      color: var(--accent-ink);
      border: none;
      border-radius: 6px;
      padding: 8px 14px;
      font-size: 13px;
      cursor: pointer;
    }
    button:hover { opacity: 0.9; }
    @media (max-width: 860px) {
      main { padding: 12px 14px 24px; }
    }
  </style>
</head>
<body>
  <main>
    <div class="card">
      <h1>${name}</h1>
      <p>${description}</p>
      <button id="btn">Action</button>
      <span id="status" style="margin-left: 12px; font-size: 13px;"></span>
    </div>
  </main>

  <script>
    if (window.toolkit?.theme?.onThemeChanged) {
      window.toolkit.theme.onThemeChanged((isDark) => {
        document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
      });
    }

    let count = 0;
    document.getElementById('btn').addEventListener('click', () => {
      count++;
      document.getElementById('status').textContent = 'Clicked ' + count + ' time' + (count === 1 ? '' : 's');
    });
  </script>
</body>
</html>`;

async function run() {
  await mkdir(appDir, { recursive: true });
  await writeFile(join(appDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  await writeFile(join(appDir, 'index.html'), indexHtml + '\n');
  await writeFile(join(appDir, 'icon.svg'), iconSvg + '\n');
  console.log(`Created mini app "${name}" in ${appDir}`);
}

run().catch((err) => {
  console.error('Failed to create mini app:', err);
  process.exit(1);
});
