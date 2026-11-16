#!/usr/bin/env bash
# Rodent installer for macOS and Linux.
#   curl -fsSL https://raw.githubusercontent.com/CMS-DEV-BUNDLE/marketplace/master/install.sh | bash
# Files fetched with curl are not quarantined, so macOS Gatekeeper will not
# block the (unsigned) app on first launch.
set -euo pipefail

REPO="CMS-DEV-BUNDLE/marketplace"   # where release binaries are published
VERSION="${RODENT_VERSION:-}"

say() { printf '\033[1m==>\033[0m %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

command -v curl >/dev/null || die "curl is required"

case "$(uname -m)" in
  arm64|aarch64) ARCH_MAC=arm64; ARCH_LINUX=arm64 ;;
  x86_64|amd64)  ARCH_MAC=x64;   ARCH_LINUX=x64 ;;
  *) die "unsupported architecture: $(uname -m)" ;;
esac

if [ -z "$VERSION" ]; then
  say "Looking up the latest release"
  VERSION="$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" \
    | sed -n 's/.*"tag_name": *"v\{0,1\}\([^"]*\)".*/\1/p' | head -n1)"
  [ -n "$VERSION" ] || die "could not determine the latest version"
fi
VERSION="${VERSION#v}"
BASE="https://github.com/$REPO/releases/download/v$VERSION"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"; [ -n "${MNT:-}" ] && hdiutil detach "$MNT" -quiet 2>/dev/null || true' EXIT

case "$(uname -s)" in
  Darwin)
    FILE="Rodent-$VERSION-mac-$ARCH_MAC.dmg"
    say "Downloading $FILE"
    curl -fL --progress-bar -o "$TMP/$FILE" "$BASE/$FILE"
    say "Installing to /Applications"
    MNT="$TMP/mnt"; mkdir -p "$MNT"
    hdiutil attach "$TMP/$FILE" -nobrowse -readonly -quiet -mountpoint "$MNT"
    DEST="/Applications"
    [ -w "$DEST" ] || { DEST="$HOME/Applications"; mkdir -p "$DEST"; }
    rm -rf "$DEST/Rodent.app"
    cp -R "$MNT/Rodent.app" "$DEST/"
    xattr -cr "$DEST/Rodent.app" 2>/dev/null || true
    say "Installed $DEST/Rodent.app (v$VERSION)"
    ;;
  Linux)
    FILE="Rodent-$VERSION-linux-x86_64.AppImage"
    [ "$ARCH_LINUX" = "x64" ] || die "only x64 Linux builds are published"
    say "Downloading $FILE"
    curl -fL --progress-bar -o "$TMP/$FILE" "$BASE/$FILE"
    mkdir -p "$HOME/.local/bin"
    install -m 755 "$TMP/$FILE" "$HOME/.local/bin/rodent"
    say "Installed ~/.local/bin/rodent (v$VERSION). Make sure ~/.local/bin is on your PATH."
    ;;
  *) die "unsupported OS: $(uname -s) (Windows: download the installer from the releases page)" ;;
esac
