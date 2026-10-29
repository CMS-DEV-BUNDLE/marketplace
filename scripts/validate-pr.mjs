#!/usr/bin/env node

/**
 * PR validation script for Dev-Toolkit Mini-Apps Marketplace.
 * Enforces manifest security rules, sandboxing restrictions, and marketplace.json schema integrity.
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const APPS_DIR = resolve('apps');
const CONFIG_FILE = resolve('marketplace.json');

const ID_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SEMVER_REGEX = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/;
const SHA256_REGEX = /^[a-f0-9]{64}$/i;
const ALLOWED_PERMISSIONS = new Set([
  'clipboard',
  'files',
  'vault.read',
  'vault.write',
  'identity',
  'p2p',
]);

let errors = [];

function check(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

async function validateManifest(appId) {
  const appDir = join(APPS_DIR, appId);
  const manifestPath = join(appDir, 'manifest.json');

  check(ID_REGEX.test(appId), `App directory name "${appId}" must be lowercase kebab-case.`);

  let raw;
  try {
    raw = await readFile(manifestPath, 'utf-8');
  } catch {
    errors.push(`[${appId}] Missing or unreadable manifest.json`);
    return;
  }

  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (e) {
    errors.push(`[${appId}] Invalid JSON in manifest.json: ${e.message}`);
    return;
  }

  check(manifest.id === appId, `[${appId}] manifest.id ("${manifest.id}") must match directory name ("${appId}").`);
  check(typeof manifest.name === 'string' && manifest.name.trim().length > 0, `[${appId}] manifest.name is required.`);
  check(SEMVER_REGEX.test(manifest.version), `[${appId}] manifest.version ("${manifest.version}") must be valid SemVer.`);
  
  const mainFile = manifest.main || 'index.html';
  check(!mainFile.includes('..'), `[${appId}] manifest.main cannot contain directory traversal (..).`);
  try {
    await stat(join(appDir, mainFile));
  } catch {
    errors.push(`[${appId}] Entry point file "${mainFile}" not found in app directory.`);
  }

  const iconFile = manifest.icon || 'icon.svg';
  check(!iconFile.includes('..'), `[${appId}] manifest.icon cannot contain directory traversal (..).`);
  try {
    await stat(join(appDir, iconFile));
  } catch {
    errors.push(`[${appId}] Icon file "${iconFile}" not found in app directory.`);
  }

  if (Array.isArray(manifest.permissions)) {
    for (const perm of manifest.permissions) {
      check(ALLOWED_PERMISSIONS.has(perm), `[${appId}] Unauthorized permission requested: "${perm}".`);
    }
  }
}

async function validateMarketplaceConfig() {
  let raw;
  try {
    raw = await readFile(CONFIG_FILE, 'utf-8');
  } catch {
    return; // marketplace.json may not exist on initial PR
  }

  let config;
  try {
    config = JSON.parse(raw);
  } catch (e) {
    errors.push(`Invalid JSON in marketplace.json: ${e.message}`);
    return;
  }

  check(Array.isArray(config.apps), 'marketplace.json must contain an "apps" array.');
  if (!Array.isArray(config.apps)) return;

  const seenIds = new Set();
  for (const app of config.apps) {
    check(ID_REGEX.test(app.id), `[marketplace.json] Invalid app ID "${app.id}".`);
    check(!seenIds.has(app.id), `[marketplace.json] Duplicate app ID found: "${app.id}".`);
    seenIds.add(app.id);

    check(typeof app.name === 'string' && app.name.length > 0, `[marketplace.json] App "${app.id}" missing name.`);
    check(SEMVER_REGEX.test(app.version), `[marketplace.json] App "${app.id}" has invalid version "${app.version}".`);
    check(typeof app.iconUrl === 'string' && app.iconUrl.startsWith('https://'), `[marketplace.json] App "${app.id}" missing or invalid iconUrl.`);

    if (app.archive) {
      check(typeof app.archive.fileName === 'string', `[marketplace.json] App "${app.id}" archive missing fileName.`);
      check(typeof app.archive.url === 'string' && app.archive.url.startsWith('https://'), `[marketplace.json] App "${app.id}" archive url must be https://.`);
      check(SHA256_REGEX.test(app.archive.sha256), `[marketplace.json] App "${app.id}" has invalid SHA-256 digest: "${app.archive.sha256}".`);
    }
  }
}

async function main() {
  console.log('🔍 Validating Marketplace mini-apps and configuration...');

  try {
    const entries = await readdir(APPS_DIR);
    for (const entry of entries) {
      const fullPath = join(APPS_DIR, entry);
      const s = await stat(fullPath);
      if (s.isDirectory()) {
        await validateManifest(entry);
      }
    }
  } catch (e) {
    errors.push(`Failed to read apps/ directory: ${e.message}`);
  }

  await validateMarketplaceConfig();

  if (errors.length > 0) {
    console.error('\n❌ Validation failed with errors:');
    for (const err of errors) {
      console.error(`   • ${err}`);
    }
    process.exit(1);
  } else {
    console.log('\n✅ All mini-apps and marketplace.json validation checks passed!');
  }
}

main().catch((err) => {
  console.error('Fatal validation error:', err);
  process.exit(1);
});
