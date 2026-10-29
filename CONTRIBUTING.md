# Contributing to Dev-Toolkit Mini-Apps Marketplace

Welcome! We love community contributions. Dev-Toolkit mini-apps are sandboxed, lightweight web tools that run locally inside the Dev-Toolkit Electron shell.

---

## 🚀 The 2-PR Contribution Workflow

To maintain code security and catalog integrity, mini-apps follow a simple 2-step PR process:

```
Step 1: Contributor submits Mini-App PR (apps/<app-id>)
               ↓
        Maintainer merges to master
               ↓
Step 2: CI automatically builds assets & publishes to GitHub Pages / Releases
        (Outputs download URL & SHA-256 hash in GitHub Actions Summary)
               ↓
Step 3: Contributor opens follow-up PR adding app entry to marketplace.json
               ↓
        Maintainer merges to master
               ↓
🎉 Live in all Dev-Toolkit Electron clients immediately!
```

---

### Step 1: Submit Your Mini-App

1. **Create a branch** from `master`:
   ```bash
   git checkout -b app/my-cool-tool
   ```

2. **Add your mini-app folder** under `apps/<your-app-id>/`:
   ```
   apps/my-cool-tool/
   ├── manifest.json   # App metadata & sandboxed permissions
   ├── index.html      # Main user interface
   ├── icon.svg        # Scalable SVG icon
   └── script.js       # Optional client logic
   ```

3. **Manifest Format (`manifest.json`)**:
   ```json
   {
     "id": "my-cool-tool",
     "name": "My Cool Tool",
     "version": "1.0.0",
     "description": "A quick description of what your tool does",
     "icon": "icon.svg",
     "main": "index.html",
     "permissions": ["clipboard"],
     "author": {
       "name": "Your Name",
       "url": "https://github.com/your-username"
     }
   }
   ```
   > **Allowed Permissions:** `clipboard`, `files`, `vault.read`, `vault.write`, `identity`, `p2p`. Mini-apps are strictly isolated without outbound internet access.

4. **Verify locally**:
   ```bash
   node scripts/validate-pr.mjs
   ```

5. **Open a PR** against `master`. Maintainers will review and merge it.

---

### Step 2: Update `marketplace.json` (The Catalog PR)

1. Once your mini-app PR is merged to `master`, GitHub Actions automatically:
   - Packages your app into `my-cool-tool-1.0.0.zip`
   - Uploads it to GitHub Pages & Releases
   - Publishes `icon.svg` to `https://cms-dev-bundle.github.io/marketplace/icons/my-cool-tool.svg`
   - Emits the exact JSON block in the **GitHub Actions Run Summary**.

2. Open a new branch `update-catalog/my-cool-tool` and add your entry to `marketplace.json`:
   ```json
   {
     "id": "my-cool-tool",
     "name": "My Cool Tool",
     "version": "1.0.0",
     "description": "A quick description of what your tool does",
     "category": "utilities",
     "icon": "icon.svg",
     "iconUrl": "https://cms-dev-bundle.github.io/marketplace/icons/my-cool-tool.svg",
     "size": "12.4 KB",
     "archive": {
       "fileName": "my-cool-tool-1.0.0.zip",
       "url": "https://github.com/CMS-DEV-BUNDLE/marketplace/releases/download/v1.0.0/my-cool-tool-1.0.0.zip",
       "pagesUrl": "https://cms-dev-bundle.github.io/marketplace/apps/my-cool-tool-1.0.0.zip",
       "sha256": "<computed-sha256>",
       "downloadBytes": 12697
     },
     "permissions": ["clipboard"],
     "author": {
       "name": "Your Name",
       "url": "https://github.com/your-username"
     }
   }
   ```

3. Submit the PR. Once merged, every Dev-Toolkit user can discover and install your tool with 1-click!
