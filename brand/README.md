# 36 Cards Brand Kit

This directory contains brand identity assets for **36 Cards** (`36cards.com`).

## Files

- `logo.svg`: Primary lockup (icon + wordmark)
- `favicon.svg`: Vector favicon source
- `tokens.css`: Global and theme color tokens
- `card-backs/*.svg`: Branded card verso designs for all shipped themes

## Typography

- Display base: `Cormorant Garamond`
- Body base: `Manrope`
- Theme accents:
  - Gothic Ink: `IM Fell English SC`
  - Retro Sci-Fi: `Orbitron`
  - Vaporwave Neon: `Space Grotesk`
  - Whimsical Storybook: `Quicksand`
  - Minimal Luxe: `Playfair Display` + `Inter`

## Favicon .ico generation guidance

Generate a multi-size `.ico` from `favicon.svg`:

```bash
# requires ImageMagick installed locally
magick brand/favicon.svg -define icon:auto-resize=16,32,48,64 public/favicon.ico
```

Then reference `public/favicon.ico` from metadata.
