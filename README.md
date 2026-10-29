# Dev-Toolkit Marketplace 🛍️

The official community mini-app registry and distribution hub for [Dev-Toolkit](https://github.com/CMS-DEV-BUNDLE/RODENT).

All mini-apps and official desktop client executables are packaged, served via **GitHub Pages**, and verified with cryptographic SHA-256 checksums.

---

## 💻 Download Rodent Desktop Client (Multi-OS)

Official Rodent desktop executables for all operating systems and architectures are hosted publicly on **[GitHub Releases](https://github.com/CMS-DEV-BUNDLE/marketplace/releases)**:

| Operating System | Architecture | Package Format | Binary Name |
|---|---|---|---|
| 🐧 **Linux** | x86_64 | Standalone AppImage | `Rodent-<version>-linux-x64.AppImage` |
| 🐧 **Linux** | x86_64 | Debian / Ubuntu (.deb) | `Rodent-<version>-linux-x64.deb` |
| 🐧 **Linux** | x86_64 | Portable Tarball | `Rodent-<version>-linux-x64.tar.gz` |
| 🍎 **macOS** | Apple Silicon (M1/M2/M3/M4) | DMG Installer | `Rodent-<version>-mac-arm64.dmg` |
| 🍎 **macOS** | Intel (x64) | DMG Installer | `Rodent-<version>-mac-x64.dmg` |
| 🍎 **macOS** | Universal | Portable Zip | `Rodent-<version>-mac-arm64.zip` / `x64.zip` |
| 🪟 **Windows** | 64-bit (x64) | NSIS Setup (.exe) | `Rodent-<version>-win-x64.exe` |
| 🪟 **Windows** | 64-bit (x64) | Portable Archive | `Rodent-<version>-win-x64.zip` |

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
