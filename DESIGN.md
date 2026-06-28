# HizmetPark Design System — Krem & Lacivert

**Memorable thing:** "Bu platforma güvenebilirim, randevumu buradan alacağım."

---

## Design Intent

HizmetPark is a two-sided marketplace (barber, hairdresser, beauty, futsal). The visual language must communicate:
- **Trust** through structure, consistency, and restraint
- **Premium feel** through generous spacing, editorial typography, and a sophisticated palette
- **Warmth** through the cream background and terracotta CTA — not coldness, not sterility

The departure from the old design (white cards, harsh red) is deliberate. Red implied urgency and warning. Navy communicates reliability and competence; terracotta gives the platform energy and Mediterranean warmth without aggression.

---

## Color Palette

```css
:root {
  /* Backgrounds */
  --bg: #FAFAF6;         /* Warm off-white page background */
  --surface: #FFFFFF;    /* Card and modal surfaces */

  /* Brand */
  --navy: #1B1D3A;       /* Header, primary nav — deep trust */
  --navy-mid: #2B3A8C;   /* Active states, focus rings, accents */

  /* CTA */
  --cta: #E85D26;        /* Booking buttons, primary action — terracotta */
  --cta-hover: #D14D1A;  /* CTA hover state */

  /* Typography */
  --text-primary: #1B1D3A;   /* Body copy, card titles */
  --text-muted: #6B6B80;     /* Descriptions, secondary info */
  --text-faint: #9B9BAA;     /* Timestamps, location, meta */

  /* Borders & Shadows */
  --border: #E6E4EF;
  --border-hover: rgba(43,58,140,0.22);
  --shadow-card: 0 1px 4px rgba(27,29,58,0.06);
  --shadow-hover: 0 8px 28px rgba(27,29,58,0.1);

  /* Semantic */
  --star: #C8973A;       /* Ratings — warm gold */
}
```

### Color Roles

| Token | Role | Do | Don't |
|-------|------|----|-------|
| `--navy` | Header background | Navigation shell, sticky containers | Inline UI, data tables |
| `--navy-mid` | Active/focus | Active nav, form focus rings, active filters | Primary CTA (use `--cta` for that) |
| `--cta` | Booking action | "Randevu Al" buttons, primary form submit | Decorative elements, error states |
| `--star` | Ratings | Star ratings, premium badges | General accents |

---

## Typography

### Font Families

```css
--font-display: 'DM Serif Display', Georgia, serif;
--font-body:    'DM Sans', 'Inter', system-ui, sans-serif;
```

**DM Serif Display** — Section headings, card business names, modal titles. Use italic variant for editorial heading character. Loaded from Google Fonts.

**DM Sans** — All body text, buttons, labels, inputs. Clean, functional, wide character support for Turkish glyphs (ş, ğ, ı, ç, ö, ü).

### Type Scale

| Role | Element | Size | Weight | Style | Family |
|------|---------|------|--------|-------|--------|
| Display | Page hero | 28–32px | 400 | italic | DM Serif Display |
| Title | Section headings, modal H2 | 17–20px | 400 | italic | DM Serif Display |
| Card name | Business name in cards | 14–16px | 700 | italic | DM Serif Display |
| Body | Descriptions, content | 14px | 400 | normal | DM Sans |
| Label | Button text, filter chips | 13–15px | 600–700 | normal | DM Sans |
| Caption | Uppercase category tags | 10–11px | 700 | normal, uppercase | DM Sans |
| Meta | Timestamps, location, counts | 11–12px | 400–500 | normal | DM Sans |

### Typography Rules

- Section headings use DM Serif Display italic: `font-family: var(--font-display); font-style: italic; font-weight: 400`
- Card business names use DM Serif Display italic for warmth and memorability
- Never use bold DM Serif Display — the italic weight gives enough character
- Body paragraphs: 1.6 line-height, DM Sans 400
- Uppercase labels: letter-spacing 0.06–0.08em, font-weight 700

---

## Spacing

```
xs:  4px
sm:  8px
md:  12–14px
lg:  16–20px
xl:  24–28px
2xl: 32px
3xl: 40–48px
```

### Card Padding
- **Default card:** 24–28px (up from 20px)
- **Modal:** 32px
- **Compact card (mini-kart):** 18–20px

### Grid Gaps
- **Business grid:** 18px
- **Mini card row:** 14px
- **Filter chips:** 8px

---

## Border Radius

```css
--radius-card: 20px;   /* Cards, modals, large containers */
--radius-btn:  12px;   /* Buttons */
/* Inputs: 10px | Small chips: 20px (pill) | Avatars: 50% */
```

---

## Shadows

```css
/* Resting card */
--shadow-card: 0 1px 4px rgba(27,29,58,0.06);

/* Hover state */
--shadow-hover: 0 8px 28px rgba(27,29,58,0.1);

/* Header (navy) */
box-shadow: 0 4px 20px rgba(27,29,58,0.18);

/* CTA button hover */
box-shadow: 0 4px 16px rgba(232,93,38,0.28);
```

---

## Motion & Animation

### Scroll Reveal

All cards and section containers use IntersectionObserver-based scroll reveal:

```css
[data-reveal] {
  opacity: 0;
  transform: translateY(22px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
[data-reveal].reveal-visible {
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  [data-reveal] { opacity: 1; transform: none; transition: none; }
}
```

**Stagger:** 70ms between sibling cards in the same grid/row. Applied via JS hook (`useScrollReveal`). Each element triggers once on first intersection — not on re-scroll.

**Hook usage:**
```js
import useScrollReveal from '../hooks/useScrollReveal';
const revealRef = useScrollReveal({ staggerMs: 70 });
// <div ref={revealRef}> wraps the section
// Add data-reveal to each card/item div
```

### Card Hover

```css
.card-component {
  transition: box-shadow 0.22s, transform 0.22s, border-color 0.22s;
}
.card-component:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-hover);
  transform: translateY(-3px);
}
```

### Button Hover

Primary CTA:
```css
transition: background 0.22s, box-shadow 0.22s, transform 0.15s;
:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(232,93,38,0.28); }
```

### Dropdown / Modal Entry

```css
@keyframes dropDown {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
animation: dropDown 0.15s ease;
```

---

## Components

### Header (Capsule Nav)

```
Background: var(--navy)   #1B1D3A
Border-radius: 20px
Margin: 14px 24px 0
Shadow: 0 4px 20px rgba(27,29,58,0.18)
```

- Logo: white text, terracotta icon (#E85D26)
- Nav items (inactive): `rgba(255,255,255,0.55)`
- Nav items (active): white on `rgba(255,255,255,0.15)` background
- Search bar: `rgba(255,255,255,0.1)` background with subtle border
- Notification bell: `rgba(255,255,255,0.1)` background
- "Giriş Yap" CTA: `var(--cta)` background
- "Kayıt Ol" ghost: transparent + white border

### Cards

**Business card (isletme-kart):**
- Background: `#FFFFFF`
- Radius: `var(--radius-card)` (20px)
- Padding: 24px
- Border: `1px solid var(--border)`
- Business name: DM Serif Display italic, 16px, `var(--text-primary)`
- Category type: DM Sans 700 uppercase, 11px, `var(--navy-mid)`
- Rating: `var(--star)` color
- "Randevu Al" button: `var(--cta)`

**Mini card (mini-kart, featured sections):**
- Radius: 20px, padding 20px
- Business name: DM Serif Display
- Hover: translateY(-3px) + navy border glow

### Buttons

| Type | Background | Color | Border |
|------|-----------|-------|--------|
| Primary (CTA) | `var(--cta)` | white | none |
| Secondary | white | `var(--navy-mid)` | `var(--navy-mid)` |
| Ghost (nav) | transparent | `rgba(255,255,255,0.85)` | `rgba(255,255,255,0.25)` |
| Destructive | transparent | `#FF8066` | `rgba(255,128,102,0.4)` |

### Filter Chips / Category Buttons

Pill shape (border-radius: 20px), inactive state: white bg + light border. Active state: `var(--navy-mid)` filled. Hover: navy border + navy text.

### Form Inputs

```css
background: #F7F6FB;
border: 1.5px solid var(--border);
border-radius: 10px;
/* focus: */
border-color: var(--navy-mid);
background: white;
```

---

## Iconography

Use Lucide React icons throughout. Default colors:
- Navigation: inherit from button color
- Category icons in cards: `var(--navy-mid)` (#2B3A8C)
- Rating stars: `var(--star)` (#C8973A)
- Notification badge: `var(--cta)`

---

## Responsive

- **Mobile ≤768px:** Bottom nav bar appears, header condenses, card grid single column
- **Tablet 769–1024px:** 2-column card grid, capsule header adjusts padding
- **Desktop ≥1300px:** Optional "Özel Fırsatlar" sidebar panel appears

---

## What NOT to do

- Don't use `#DC2626` red anywhere — it was the old accent and conflicts with the trust-first direction
- Don't use black backgrounds — the dark palette is reserved for the navy header shell only
- Don't add more than 2 accent colors in any single view
- Don't use DM Serif Display bold — the italic at regular weight is the intended style
- Don't animate the same element twice on scroll (the hook uses `unobserve` to prevent this)
- Don't use `transform: translateY` over 24px for reveal — subtle is the point

---

## Implementation Files

| File | Purpose |
|------|---------|
| `src/App.css` | Global tokens (`:root`), base resets, scroll reveal CSS |
| `src/components/Layout.css` | Navy capsule header styles |
| `src/components/Layout.js` | Header nav inline styles (active states, icon colors) |
| `src/pages/MusteriAnaSayfa.css` | Customer homepage — all component styles |
| `src/hooks/useScrollReveal.js` | IntersectionObserver scroll reveal hook |
| `public/index.html` | Google Fonts: DM Serif Display + DM Sans |
