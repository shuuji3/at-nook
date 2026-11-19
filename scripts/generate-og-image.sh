#!/usr/bin/env bash
#
# Regenerate public/og.png — the OpenGraph card: the nook cover photo dimmed with
# the same 35% overlay as the app backdrop, the at-nook icon (public/favicon.svg)
# centered above the "at-nook" wordmark in the app's handwriting font.
#
# Requires: ImageMagick (convert) with the pango delegate, and curl.
#
# The handwriting font is the app's hand font, Shadows Into Light Two (OFL); only
# its .woff2 is shipped in public/fonts, which pango cannot read, so the .ttf is
# fetched here into a cache dir and exposed to fontconfig just for this render.
#
set -euo pipefail

# overridable knobs (defaults reproduce the committed og.png)
ICON_INK="${ICON_INK:-360}"   # visible icon height in px (trimmed, padding removed)
WORD_INK="${WORD_INK:-100}"   # visible wordmark height in px
GAP="${GAP:-36}"              # vertical gap between icon and wordmark in px
WIDTH="${WIDTH:-1200}"
HEIGHT="${HEIGHT:-630}"
ALPHA="${ALPHA:-}"            # set to anything to add the superscript α

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
photo="$root/public/images/5580663027_deeb68abf8_o-flickr-kharlamovaa-cc-by-2.0.jpg"
icon_svg="$root/public/favicon.svg"
out="$root/public/og.png"

hand='Shadows Into Light Two'
ink_color='#f6ead8'

command -v convert >/dev/null || { echo "error: ImageMagick 'convert' not found" >&2; exit 1; }
[ -f "$photo" ] || { echo "error: cover photo not found: $photo" >&2; exit 1; }
[ -f "$icon_svg" ] || { echo "error: icon svg not found: $icon_svg" >&2; exit 1; }

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

# --- font: fetch the hand font .ttf and expose it to fontconfig for this run ---
cache="${XDG_CACHE_HOME:-$HOME/.cache}/at-nook"
font_ttf="$cache/ShadowsIntoLightTwo-Regular.ttf"
if [ ! -f "$font_ttf" ]; then
  mkdir -p "$cache"
  curl -fsSL -o "$font_ttf" \
    https://github.com/google/fonts/raw/main/ofl/shadowsintolighttwo/ShadowsIntoLightTwo-Regular.ttf
fi
cat >"$tmp/fonts.conf" <<EOF
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <include ignore_missing="yes">/etc/fonts/fonts.conf</include>
  <dir>$cache</dir>
</fontconfig>
EOF
export FONTCONFIG_FILE="$tmp/fonts.conf"

# --- base: the cover photo, center/cover cropped, with the app's 35% overlay ---
convert "$photo" -resize "${WIDTH}x${HEIGHT}^" -gravity center -extent "${WIDTH}x${HEIGHT}" \
  -fill 'rgba(0,0,0,0.35)' -colorize 35% "$tmp/base.png"

# --- icon: vector source rasterized large, trimmed to its ink, scaled to target ---
convert -background none -density 600 "$icon_svg" -trim +repage -resize "x${ICON_INK}" "$tmp/icon.png"

# --- wordmark: hand font, rendered large then trimmed and scaled to target ---
p=$(( WORD_INK * 100 / 55 ))
word_markup="<span font=\"$hand $p\" foreground=\"$ink_color\">at-nook</span>"
if [ -n "$ALPHA" ]; then
  word_markup+="<span font=\"$hand $(( p * 6 / 10 ))\" foreground=\"$ink_color\" rise=\"$(( p * 28 / 100 * 1000 ))\">α</span>"
fi
convert -background none -gravity center "pango:$word_markup" -trim +repage -resize "x${WORD_INK}" "$tmp/word.png"

# --- stack: icon + gap + word, centered as a block on the base ---
convert -background none "$tmp/icon.png" -size x"$GAP" xc:none "$tmp/word.png" -append "$tmp/lock.png"

convert "$tmp/base.png" "$tmp/lock.png" -gravity center -composite "$out"

echo "wrote $out ($(identify -format '%wx%h' "$out"))"
