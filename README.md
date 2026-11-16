# Dev-Toolkit Marketplace 🛍️

The official community mini-app registry and distribution hub for [Dev-Toolkit](https://github.com/CMS-DEV-BUNDLE/RODENT).

All mini-apps and official desktop client executables are packaged, served via **GitHub Pages**, and verified with cryptographic SHA-256 checksums.

---

## ⚡ Quick Install

### macOS

**Homebrew** (recommended):

```sh
brew tap CMS-DEV-BUNDLE/tap
brew install --cask CMS-DEV-BUNDLE/tap/rodent
```

**Install script** (macOS and Linux):

```sh
curl -fsSL https://raw.githubusercontent.com/CMS-DEV-BUNDLE/marketplace/master/install.sh | bash
```

The script installs the latest release (pin one with `RODENT_VERSION=1.3.3`). On macOS it puts `Rodent.app` in `/Applications`, or `~/Applications` if that isn't writable. On Linux it installs the AppImage to `~/.local/bin/rodent`.

Rodent is not yet signed with an Apple Developer ID, so a copy downloaded manually in a browser is blocked by Gatekeeper ("Rodent is damaged and can't be opened"). The app is not damaged. Pick one:

- Use Homebrew or the install script above, which avoid the warning.
- Or run `xattr -cr /Applications/Rodent.app`, then open it.
- Or open it once, then go to **System Settings → Privacy & Security → Open Anyway**.

### Windows

Download the `.exe` from the table below. Windows SmartScreen may warn because the installer is unsigned: choose **More info → Run anyway**.

---

## 💻 Download Rodent Desktop Client (Multi-OS)

Official Rodent desktop executables for all operating systems and architectures are hosted publicly on **[GitHub Releases](https://github.com/CMS-DEV-BUNDLE/marketplace/releases)**:

| Operating System | Architecture | Package Format | Binary Name |
|---|---|---|---|
| 🐧 **Linux** | x86_64 | Standalone AppImage | `Rodent-<version>-linux-x86_64.AppImage` |
| 🐧 **Linux** | x86_64 | Debian / Ubuntu (.deb) | `Rodent-<version>-linux-amd64.deb` |
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
