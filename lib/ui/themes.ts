export interface ThemeConfig {
  id: ThemeId;
  label: string;
  subtitle: string;
  bodyClass: string;
  cardBackAsset: string;
  previewCardFile: string;
  displayFontClass: string;
  bodyFontClass: string;
  palette: {
    background: string;
    panel: string;
    border: string;
    accent: string;
    text: string;
    muted: string;
  };
  artDirection: {
    illustrationStyle: string;
    cardBackGuidance: string;
    prompt: string;
  };
}

export type ThemeId =
  | "botanical-engraving"
  | "ethiopian"
  | "hand-illustrated"
  | "minimal-lux"
  | "neo-noir"
  | "traditional";

export const THEMES: ThemeConfig[] = [
  {
    id: "traditional",
    label: "Classic",
    subtitle: "Timeless cartomancy deck",
    bodyClass: "theme-ethiopian",
    cardBackAsset: "/brand/card-backs/traditional.webp",
    previewCardFile: "001 Rider.png",
    displayFontClass: "font-display-botanical",
    bodyFontClass: "font-body-quiet",
    palette: {
      background: "#efe6d8",
      panel: "#fbf5eb",
      border: "#bca07d",
      accent: "#8a5931",
      text: "#2f2117",
      muted: "#765741",
    },
    artDirection: {
      illustrationStyle: "classic engraved cartomancy illustration, antique paper and ink texture",
      cardBackGuidance: "traditional ornamental border and centered 36 crest",
      prompt: "Lenormand card illustration, traditional style, antique engraving influence, period-authentic symbolism",
    },
  },
  {
    id: "botanical-engraving",
    label: "Engraving",
    subtitle: "Gentle detailed deck",
    bodyClass: "theme-ethiopian",
    cardBackAsset: "/brand/card-backs/botanical-engraving.webp",
    previewCardFile: "001 Rider.png",
    displayFontClass: "font-display-botanical",
    bodyFontClass: "font-body-quiet",
    palette: {
      background: "#edf5e8",
      panel: "#f7fbf4",
      border: "#9ab28f",
      accent: "#3f6d46",
      text: "#1c2b20",
      muted: "#5b6e5f",
    },
    artDirection: {
      illustrationStyle: "etched flora, linework symbolism, muted parchment grain",
      cardBackGuidance: "botanical wreath around 36 mark, thin engraved frame",
      prompt: "Lenormand card illustration, botanical engraving style, natural pigments, etched line details, premium print finish",
    },
  },
  {
    id: "hand-illustrated",
    label: "Journal",
    subtitle: "Evocative calm deck",
    bodyClass: "theme-ethiopian",
    cardBackAsset: "/brand/card-backs/hand-illustrated.webp",
    previewCardFile: "001 Rider.png",
    displayFontClass: "font-display-botanical",
    bodyFontClass: "font-body-quiet",
    palette: {
      background: "#f7efe0",
      panel: "#fffaf1",
      border: "#d7b68c",
      accent: "#a65d3a",
      text: "#38261b",
      muted: "#7e6048",
    },
    artDirection: {
      illustrationStyle: "hand-rendered painterly forms, visible brush texture, storybook realism",
      cardBackGuidance: "classic crest frame with hand-inked edges",
      prompt: "Lenormand card illustration, hand-illustrated style, painterly texture, narrative symbolism, premium print quality",
    },
  },
  {
    id: "minimal-lux",
    label: "Lux",
    subtitle: "Minimal premium deck",
    bodyClass: "theme-ethiopian",
    cardBackAsset: "/brand/card-backs/minimal-lux.webp",
    previewCardFile: "001 Rider.png",
    displayFontClass: "font-display-botanical",
    bodyFontClass: "font-body-quiet",
    palette: {
      background: "#f3f1ee",
      panel: "#ffffff",
      border: "#c3b9ab",
      accent: "#7b6548",
      text: "#201912",
      muted: "#655a4d",
    },
    artDirection: {
      illustrationStyle: "minimal serif iconography, micro-grain, editorial spacing",
      cardBackGuidance: "debossed monogram feel with thin metallic line frame",
      prompt: "Lenormand card illustration, minimal luxe style, restrained palette, refined iconography, editorial composition",
    },
  },
  {
    id: "neo-noir",
    label: "Noir",
    subtitle: "Cinematic midnight deck",
    bodyClass: "theme-ethiopian",
    cardBackAsset: "/brand/card-backs/neo-noir.webp",
    previewCardFile: "001d Rider.png",
    displayFontClass: "font-display-botanical",
    bodyFontClass: "font-body-quiet",
    palette: {
      background: "#12131c",
      panel: "#1b1f2a",
      border: "#3f4659",
      accent: "#e0b266",
      text: "#f4f0e8",
      muted: "#adb3c4",
    },
    artDirection: {
      illustrationStyle: "cinematic shadows, dramatic highlights, ink-noir mood",
      cardBackGuidance: "dark deco frame with gold-accent 36 insignia",
      prompt: "Lenormand card illustration, neo-noir style, cinematic light, deep shadow contrast, elegant occult symbolism",
    },
  },
  {
    id: "ethiopian",
    label: "Storybook",
    subtitle: "Vibrant whimsical deck",
    bodyClass: "theme-ethiopian",
    cardBackAsset: "/brand/card-backs/ethiopian.webp",
    previewCardFile: "001 Rider.png",
    displayFontClass: "font-display-botanical",
    bodyFontClass: "font-body-quiet",
    palette: {
      background: "#f4e8d0",
      panel: "#fff7ea",
      border: "#c9a770",
      accent: "#8b5d2f",
      text: "#2e1d13",
      muted: "#79573b",
    },
    artDirection: {
      illustrationStyle: "heritage manuscript motifs, warm pigments, icon-forward symbolism",
      cardBackGuidance: "ornamental manuscript frame and central 36 sigil",
      prompt: "Lenormand card illustration, Ethiopian-inspired manuscript aesthetic, warm parchment tones, ceremonial iconography, high detail",
    },
  },
];

export const THEME_BY_ID = new Map(THEMES.map((theme) => [theme.id, theme]));

export function getTheme(themeId: string): ThemeConfig {
  return THEME_BY_ID.get(themeId as ThemeId) ?? THEMES[0];
}
