#!/usr/bin/env node

/**
 * Packaging & asset generation script for Dev-Toolkit Mini-Apps Marketplace.
 * Creates zip archives, extracts icons, calculates SHA-256 hashes, and prepares dist/ for GitHub Pages.
 */

import { readdir, readFile, writeFile, mkdir, stat, copyFile, appendFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const APPS_DIR = resolve('apps');
const DIST_DIR = resolve('dist');
const DIST_APPS_DIR = join(DIST_DIR, 'apps');
const DIST_ICONS_DIR = join(DIST_DIR, 'icons');

const REPO_OWNER = 'CMS-DEV-BUNDLE';
const REPO_NAME = 'marketplace';
const GITHUB_PAGES_BASE = `https://${REPO_OWNER.toLowerCase()}.github.io/${REPO_NAME}/`;
const GITHUB_RELEASE_BASE = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/v1.0.0/`;

const CATEGORIES = {
  diff: 'formatters',
  'json-beautify': 'formatters',
  'jwt-io': 'security',
  'color-picker': 'utilities',
  'json-to-table': 'converters',
  json4swift: 'converters',
  'world-clock': 'utilities',
  'live-text': 'security',
};

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function computeSha256(filePath) {
  const content = await readFile(filePath);
  return createHash('sha256').update(content).digest('hex');
}

async function packageApp(appId) {
  const appFolder = join(APPS_DIR, appId);
  const manifestPath = join(appFolder, 'manifest.json');

  const manifest = JSON.parse(await readFile(manifestPath, 'utf-8'));
  const version = manifest.version || '1.0.0';
  const zipName = `${appId}-${version}.zip`;
  const zipPath = join(DIST_APPS_DIR, zipName);

  // Package zip archive
  execFileSync('zip', ['-q', '-r', zipPath, '.'], { cwd: appFolder });

  const zipStat = await stat(zipPath);
  const sha256 = await computeSha256(zipPath);

  // Copy icon to dist/icons
  const srcIcon = join(appFolder, manifest.icon || 'icon.svg');
  const destIcon = join(DIST_ICONS_DIR, `${appId}.svg`);
  try {
    await copyFile(srcIcon, destIcon);
  } catch {}

  return {
    id: manifest.id,
    name: manifest.name,
    version: manifest.version,
    description: manifest.description || '',
    category: CATEGORIES[manifest.id] || manifest.category || 'utilities',
    icon: manifest.icon || 'icon.svg',
    iconUrl: `${GITHUB_PAGES_BASE}icons/${manifest.id}.svg`,
    size: formatSize(zipStat.size),
    archive: {
      fileName: zipName,
      url: `${GITHUB_RELEASE_BASE}${zipName}`,
      pagesUrl: `${GITHUB_PAGES_BASE}apps/${zipName}`,
      sha256,
      downloadBytes: zipStat.size,
    },
    permissions: manifest.permissions || [],
    author: manifest.author || {
      name: 'Community Contributor',
      url: `https://github.com/${REPO_OWNER}/${REPO_NAME}`,
    },
  };
}

async function main() {
  console.log('⚡ Starting Dev-Toolkit Marketplace packaging pipeline...');

  await mkdir(DIST_APPS_DIR, { recursive: true });
  await mkdir(DIST_ICONS_DIR, { recursive: true });

  const entries = await readdir(APPS_DIR);
  const packagedApps = [];

  for (const entry of entries) {
    const fullPath = join(APPS_DIR, entry);
    const s = await stat(fullPath);
    if (!s.isDirectory()) continue;

    try {
      console.log(`📦 Packaging ${entry}...`);
      const meta = await packageApp(entry);
      packagedApps.push(meta);
      console.log(`   ✓ ${meta.name} (v${meta.version}) -> ${meta.archive.fileName} (${meta.size}, sha256: ${meta.archive.sha256.slice(0, 12)}...)`);
    } catch (err) {
      console.error(`   ✗ Failed to package ${entry}:`, err.message);
    }
  }

  // Load or sync marketplace.json
  const configPath = resolve('marketplace.json');
  let currentConfig = { schemaVersion: '1.0.0', updatedAt: new Date().toISOString(), appsCount: 0, apps: [] };
  try {
    currentConfig = JSON.parse(await readFile(configPath, 'utf-8'));
  } catch {
    console.log('ℹ No existing marketplace.json found, creating fresh registry.');
  }

  // If marketplace.json is empty or needs populating with packaged apps
  if (!currentConfig.apps || currentConfig.apps.length === 0) {
    currentConfig.apps = packagedApps;
  }
  currentConfig.updatedAt = new Date().toISOString();
  currentConfig.appsCount = currentConfig.apps.length;

  // Write to repo root and to dist/
  await writeFile(configPath, JSON.stringify(currentConfig, null, 2), 'utf-8');
  await copyFile(configPath, join(DIST_DIR, 'marketplace.json'));

  console.log(`\n🎉 Packaged ${packagedApps.length} apps into ${DIST_APPS_DIR}`);
  console.log(`📑 Marketplace catalog updated: ${configPath}`);

  // If running in GitHub Actions, emit Step Summary with PR snippet
  if (process.env.GITHUB_STEP_SUMMARY) {
    let summary = `## 📦 Marketplace Assets Generated\n\n`;
    summary += `| App | Version | Size | Download Archive | SHA-256 Digest |\n`;
    summary += `|---|---|---|---|---|\n`;
    for (const app of packagedApps) {
      summary += `| **${app.name}** (\`${app.id}\`) | \`${app.version}\` | ${app.size} | [${app.archive.fileName}](${app.archive.pagesUrl}) | \`${app.archive.sha256.slice(0, 16)}...\` |\n`;
    }

    summary += `\n### 📝 Next Step: Update \`marketplace.json\`\n`;
    summary += `To make new or updated mini-apps available in the Dev-Toolkit client, open a PR adding or updating the app entry in \`marketplace.json\`.\n\n`;
    summary += `\`\`\`json\n` + JSON.stringify(packagedApps, null, 2) + `\n\`\`\`\n`;

    await appendFile(process.env.GITHUB_STEP_SUMMARY, summary, 'utf-8');
  }
}

main().catch((err) => {
  console.error('Fatal packaging error:', err);
  process.exit(1);
});
