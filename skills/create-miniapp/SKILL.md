---
name: create-miniapp
description: Scaffold and validate a new sandboxed mini app in Dev Toolkit with manifest.json, index.html, theme tokens, and zero-config discovery.
---

# Create Mini App Skill

Use this skill when you need to create, scaffold, or test a new plug-in mini app for Dev Toolkit.

## Quick Scaffolding

To create a new mini app using the built-in helper script:

```bash
node skills/create-miniapp/scripts/create.mjs <app-id> "<App Name>" "<Description>"
```

**Example:**
```bash
node skills/create-miniapp/scripts/create.mjs timestamp-converter "Timestamp Converter" "Convert Unix epochs to human-readable dates"
```

This creates:
- `apps/<app-id>/manifest.json`
- `apps/<app-id>/index.html`
- `apps/<app-id>/icon.svg`

---

## Manual Creation Procedure

If creating files manually, follow these steps:

### 1. Create App Directory
Create a folder inside `apps/` with the app ID:
```bash
mkdir -p apps/<app-id>
```

### 2. Create `apps/<app-id>/manifest.json`
The manifest must conform to the following schema:
- `id`: Lowercase alphanumeric + hyphens (`/^[a-z0-9-]{2,32}$/`).
- `name`: 1–40 characters.
- `version`: Strict SemVer (`x.y.z`).
- `entry`: Relative path to HTML entry file (must stay inside app folder; path traversal is rejected).
- `permissions`: Array of strings (`clipboard`, `files`, `vault.read`, `vault.write`, `identity`, `p2p`). Use `[]` if none.
- `tabs`: Optional object configuring multi-tab behavior:
  - `allowMultiple`: Boolean (default `true`). Whether this mini-app can run in multiple tabs.
  - `allowDuplicates`: Boolean (default `false`). Whether multiple duplicate tabs of this exact app can be opened simultaneously.
  - `maxTabs`: Optional positive integer limiting max concurrent tabs for this app.

```json
{
  "id": "my-tool",
  "name": "My Tool",
  "version": "1.0.0",
  "description": "Short description of the mini app",
  "icon": "icon.svg",
  "entry": "index.html",
  "permissions": [],
  "tabs": {
    "allowMultiple": true,
    "allowDuplicates": true
  },
  "window": {
    "minWidth": 720,
    "minHeight": 480
  }
}
```

### 3. Create `apps/<app-id>/index.html`
Mini apps run inside a sandboxed `WebContentsView` with a strict CSP (`default-src 'none'`) and total network blocking. All scripts, styles, and assets must be local.

#### Screen Resolution & Responsive Design Rules (PC to Laptop Only)
Mini-apps must be fully responsive across PC and laptop resolutions (from 1920x1080+ desktops down to 1440x900, 1366x768, and 1024x768 laptops):
1. **Full-Width Fluid Containers:** Always set `main { width: 100%; max-width: 100%; margin: 0; padding: 14px 20px 32px; }`. Never constrain `main` with narrow fixed limits like `max-width: 1200px` or `1280px` with `margin: 0 auto`, which create 200px-350px dead margin voids on PC/laptop displays.
2. **Sidebar Allowance & Breakpoints:** The host shell has a 220px sidebar (collapsible to 56px). Use breakpoints at `860px`–`980px` so side-by-side columns (e.g., input vs output) collapse to a single column cleanly on compact laptops.
3. **Viewport Height Clamping:** Sizable components (editors, tables, diff panes) must use `clamp()` with `vh` (e.g., `height: clamp(220px, 40vh, 600px);`) so utility tools fill the vertical space naturally on both 768p laptops and 1080p/1440p PC monitors without unnecessary scrolling.
4. **Desktop Grid Grouping:** When displaying multiple cards, pair secondary cards in a 2-column grid (`display: grid; grid-template-columns: 1fr 1fr; gap: 14px;`) on desktop/laptops that collapses to 1 column below 980px.

Include theme synchronization with the shell:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>App Title</title>
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
      padding: 16px;
    }
    @media (max-width: 860px) {
      main { padding: 12px 14px 24px; }
    }
  </style>
</head>
<body>
  <main>
    <div class="card">
      <h1>App Title</h1>
    </div>
  </main>

  <script>
    // Listen for dark/light mode toggles from the shell
    if (window.toolkit?.theme?.onThemeChanged) {
      window.toolkit.theme.onThemeChanged((isDark) => {
        document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
      });
    }
  </script>
</body>
</html>
```

### 4. Create `apps/<app-id>/icon.svg` (Theme-Compatible SVG)
Mini-app icons are displayed across both dark and light themes in the host shell, sidebar, and marketplace catalog (via `<img>` tags and inline SVGs). Because SVGs loaded via `<img>` tags run in an isolated document context where external styles do not cascade, the SVG **must** embed internal CSS media queries to ensure automatic dark/light theme switching.

Provide a 24x24 SVG inside the folder matching this pattern:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <style>
    :root { color: #1B1F1D; }
    @media (prefers-color-scheme: dark) { :root { color: #E6E9E6; } }
  </style>
  <!-- Vector paths using currentColor -->
</svg>
```

**Key SVG Icon Guidelines:**
1. **Embedded Theme Palette:** Always include:
   ```xml
   <style>
     :root { color: #1B1F1D; }
     @media (prefers-color-scheme: dark) { :root { color: #E6E9E6; } }
   </style>
   ```
2. **Dynamic Strokes & Fills:** Use `stroke="currentColor"` or `fill="currentColor"` so icon vectors automatically render dark `#1B1F1D` on light surfaces and crisp light `#E6E9E6` in dark mode.
3. **Dimensions:** Standard viewBox is `0 0 24 24` with `width="24"` and `height="24"`. Recommended stroke width is `1.8` to `2.0`.
4. **Accent Colors:** If secondary highlight strokes are used, use theme-safe accents such as `#1F8A3D` (green), `#0F6E66` / `#4FB8AD` (teal), or `#B3321F` (red).
5. **Emoji Alternative:** Alternatively, set `"icon"` in `manifest.json` to a single emoji (e.g. `"🛠️"`).

---

## Verification & Testing

Always verify that the new mini app passes scanner validation:

1. **Run Scanner Tests:**
   ```bash
   npm test
   ```
2. **Launch Dev Shell:**
   ```bash
   npm run dev
   ```
   Confirm the new mini app appears in the sidebar and responds to theme switches.
