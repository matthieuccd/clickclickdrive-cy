# ClickClickDrive.de brand audit

Extracted from `home.html` (live HTML) and `logo.svg` (downloaded asset) on 2026-06-08.

## Colors (real hex codes from inline `<style>` blocks + logo)

| Token | Hex | Source |
|------|------|--------|
| brand primary (logo, hover) | `#F74656` | logo.svg `fill="#F74656"` (×2) + `.Article__Wrapper:hover .ijFmis{color:#f74656}` |
| brand-dark (solid CTAs)     | `#DB1F35` | inline CSS (×4) |
| brand-darker (variant)      | `#E6273E` | inline CSS (×1) |
| brand-accent (banner)       | `#F63151` | `.discountWrapper{background-color:#f63151}` |
| text primary (slate-blue)   | `#354354` | logo `fill="#354354"` + `.ijFmis{color:#354354}` |
| page background             | `#F9F9F9` | `body{background-color:#f9f9f9}` |
| surface                     | `#FFFFFF` | `.siteHeader{background-color:white}` |

## Typography

- Font family: **Mulish** (variable, 400–900), preloaded as `/assets/fonts/Mulish-variable.woff2`.
- Aliased in CSS as `'Muli'` via `@font-face`.
- **Caveat for Cyprus**: Mulish on Google Fonts ships with `latin / latin-ext / cyrillic / vietnamese` — *no Greek subset*. Our `apps/web` pairs Mulish (Latin) with **Noto Sans** (Greek subset) in the font stack so Greek copy gets real glyphs instead of fallback substitution. If you find the mixed feel jarring, switch the whole stack to Inter or Manrope (both ship Greek).

## Logo

- `/assets/images/logo.svg`, 8.4 KB, `width=138 height=32`, two paths only:
  - `fill="#354354"` for the text mark
  - `fill="#F74656"` for the accent shape (×2)
- Header sizing on CCD.de: `42px` mobile, `54px` desktop (`img.logo`). Saved verbatim to `apps/web/public/logo.svg`.

## Header layout

- White background, full width.
- Padding: `16px 30px 5px 30px` mobile, `20px 30px` desktop.
- Logo on the left, nav links on the right.
- Above the header on certain pages: a thin red `discountWrapper` band at `background:#F63151`.

## Body / page

- Page background: `#F9F9F9` (warm off-white, not pure white).
- Body text color: `#354354`.
- Heading hover: shifts to `#F74656` (the logo red).
- Stack: Next.js (legacy pages router, judging by `/_next/static/chunks/pages/_app-*.js`) + styled-components 4.4.1 + Bootstrap-style 12-col grid.

## What I deliberately didn't copy

- Their old Ionicons icon font (`.callMeBackForm .phoneInput:before{font-family:Ionicons}`) — using inline SVG icons instead, lighter and matches the Next 16 / React 19 stack we're on.
- The `pages/_app` chunked legacy Next setup — we're on App Router, that's a different generation of Next.
- Marketing copy from the German site — Cyprus market gets its own Greek-first voice.

## What downstream code needs to honor

- All "brand" / CTA surfaces should use `--color-brand` (#F74656) or `--color-brand-dark` (#DB1F35) for solid fills.
- Body / nav / heading text → `--color-text-primary` (#354354), NOT pure black.
- Page background → `--color-background` (#F9F9F9), NOT pure white. The white belongs to surfaces (cards, header).
- Rating stars stay gold (`--color-star: #F59E0B`) — CCD.de doesn't surface stars in a way I could sample, and red stars read as warnings, so going with the conventional gold.
