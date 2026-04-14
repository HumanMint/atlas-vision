# Atlas Vision — Notes & TODO

This file tracks pending work and known issues that aren't tracked in code.
Update as items are resolved.

---

## Camera & Lens Data

**Status:** All data in `public/data/cameras.csv` and `public/data/lenses.csv` is currently a small placeholder set with approximate values. It is **not** authoritative and should not be used for production cinematography decisions until verified.

### Known issues fixed in v1.3 (2026-04-14)

- **Fujifilm X-H2S** (`cameras.csv`): Was listed as `NativeAnamorphic=True` with no supported squeezes, which produced a broken UI string ("⚠ Native: x"). Set to `NativeAnamorphic=False` until real anamorphic support per X-H2S firmware version is confirmed. The X-H2S does have de-squeeze monitoring features but exact supported ratios per firmware should be verified.

### Known issues still pending

- **All sensor dimensions (mm):** Should be cross-checked against manufacturer spec sheets. Vignetting math depends on these being exact.
- **All "supported squeezes" lists:** Currently rough. Should be verified against each manufacturer's manual or release notes for the firmware version that introduced each anamorphic de-squeeze ratio.
- **Mode names:** Some are abbreviations (e.g. "4.6K 3:2 Open Gate") and may not exactly match how the manufacturer labels them in-camera.
- **Atlas lens data** (`lenses.csv`): Only Orion (2.0x) and Mercury (1.5x) series are present. Image circle values should be verified against Atlas Lens Co.'s published spec sheets.

### Full data refresh (planned)

The roadmap is to populate the database with every major cinema camera body and shooting mode. Approximate scope: ~50–70 bodies, ~300–500 rows.

Recommended sources:

1. **Manufacturer PDFs** — ARRI, Sony, RED, Blackmagic, Canon, Panasonic, Fujifilm, Z Cam, DJI Ronin 4D, Kinefinity all publish detailed spec sheets and user manuals. These are the authoritative source.
2. **CineD / Y.M.Cinema / Newsshooter** — useful for launch-day spec aggregations and the "what's actually new" framing.
3. **AbelCine / ShareGrid / Cinematography.com** — community-maintained comparison tables, good for cross-reference.

Wikipedia is **not** a reliable source for cinema camera specs. DPReview is mostly stills-focused and frequently lacks anamorphic/cinema mode details.

The math-sensitive fields (`Width`, `Height` in mm, `NativeAnamorphic`, `SupportedSqueezes`) must be exact. `Resolution` and `Mode` name are easier and more forgiving.

---

## Tooling TODO

### Skipped in v1.3 cleanup pass — revisit before public launch

- **SEO / social meta tags:** Open Graph, Twitter cards, canonical URL, descriptive `<meta description>` for sharing.
- **Favicon & manifest icons:** A temporary SVG favicon ("A" mark in Atlas gold) was added in v1.3, but `favicon.ico`, `logo192.png`, `logo512.png` are still the default Create-React-App React-atom icons. Need a properly designed Atlas-branded favicon set.
- **Tests:** `@testing-library/react`, `jest-dom`, `user-event` etc. are installed but unused. Either add a smoke test or remove the deps to shrink `node_modules`.
- **Accessibility pass:** Modal focus trap, keyboard close (Esc on changelog modal), `aria-label` on icon-only buttons, `htmlFor`/`id` association on selects.
- **`prefers-reduced-motion`:** Not currently respected by transitions or fade-in animations.
- **Splash screen flash:** `manifest.json` `background_color` was switched to `#000000` in v1.3 to match the dark theme — verify this looks right on mobile install.
- **CSS variable drift:** `--font-stack` (in `index.css`) and `--primary-font` (in `App.css`) are duplicates with different names. Pick one.

### Future / nice-to-have

- Move from GitHub Pages to a custom domain when ready for "real" public launch (per project owner: GH Pages is fine for now).
- Lighthouse / accessibility audit before launch.
- Error reporting / analytics (Sentry, Plausible, or similar).
- Remove `React.StrictMode` double-fetch in dev by guarding `useEffect` with an `AbortController` (cosmetic — not a bug in prod).
