# Dev-Toolkit Marketplace 🛍️

The official community mini-app registry and distribution hub for [Dev-Toolkit](https://github.com/CMS-DEV-BUNDLE/RODENT).

All mini-apps are packaged, served via **GitHub Pages**, and verified with cryptographic SHA-256 checksums.

---

## 🌐 Public Endpoints

| Resource | Public URL |
|---|---|
| **Catalog Registry** | `https://cms-dev-bundle.github.io/marketplace/marketplace.json` |
| **Icons Directory** | `https://cms-dev-bundle.github.io/marketplace/icons/<app-id>.svg` |
| **App Download Archives** | `https://cms-dev-bundle.github.io/marketplace/apps/<app-id>-<version>.zip` |

---

## 🛠️ Contributing a Mini-App

Read the **[Contributing Guide](CONTRIBUTING.md)** to add your mini-app.

1. **Step 1:** Create branch -> Add `apps/<app-id>` -> Submit PR -> Merged to `master`
2. **Step 2:** CI builds public zip and emits SHA-256
3. **Step 3:** Submit PR updating `marketplace.json` -> Merged to `master`

---

## 🧪 Local Scripts

```bash
# Validate all mini-apps and marketplace.json schema
npm run validate

# Package apps into dist/ and generate hashes
npm run package
```
