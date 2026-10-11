# The Daybook website

The public site for My Medical Daybook at mymedicaldaybook.co.uk (GitHub Pages from `main`, root). The app is a separate repository, `Learning-Development667/Mark_Medical`; this site only links to it. Built 11 October 2026 from the website brief (Claude Docs, "Daybook website brief"), the home page words ("Daybook home page words") and the brand guide (Mark's Branding folder, `Daybook brand guide.docx`, version 1.2). Follow those; where they and this file disagree, the brand guide wins.

## Rules
- Plain HTML, CSS and JS. No frameworks, no build step, no cookies, no analytics scripts, no forms. GitHub Pages serves pages only, so Join the Beta links to the app's own sign-up.
- All work on `main`. Bump `?v=` on `css/site.css` and `js/site.js` in every page when either changes. Run `node --check js/site.js` before committing.
- UK English. No em dashes. Body text 18px, 4.5:1 contrast, 48px tap targets, WCAG 2.2 AA with zero axe violations, nothing overflows at 320px. Every picture has alt text from the words doc.
- Brand (guide 1.2): plum #5B2E5E big and bold only (headings, large numbers, buttons, thick strokes), apricot #E59E6D as fills never text (text form #A55A23), cream #F7F1EA page, ink #17263A body, Fraunces 600 for headings and Inter for everything else. Dark mode tokens in `css/site.css`.
- Mark 1 Apps appears in the footer only: the copyright line, company number and registered office. No page, section or headline about the company.
- No health data, ever. The report pictures come from the app's shared demo (`media/report-1.png`, `-2`).
- Quotes go live only in the person's own approved words. Nothing made up.

## Files
- `index.html`: the home page, one scroll: the opening film, the gap, two of us one list, the report (with the real demo report pages), your circle, private by design, the close, the footer.
- `privacy.html`, `terms.html`: the app's own privacy and terms text, copied from `Mark_Medical/index.html` templates (`tpl-privacy`, `tpl-terms`) with `h3` made `h2` and the contact span filled. When the app's text changes, copy it again.
- `support.html`: how to get help, install steps, common questions, how to delete records.
- `css/site.css`, `js/site.js` (the film plays once over its poster then rests; the stills get a slow zoom when scrolled into view; both off under reduced motion).
- `media/`: the walk film (1280 mp4 and webm, 1920 mp4, posters) and the five stills at 800 and 1600 (jpg and webp); `icons/`: the Daybook mark at the sizes the site needs, plus the plain and one-colour SVGs.
- The masters live in Mark's Branding folder and in the app repository's ignored `reports/brand` folder.

## Still to do
- Charlene's and Shelley's quotes, once given and approved.
- Point `mymedicaldaybook.co.uk` at this site (CNAME file here, DNS at Cloudflare) and change every app link to `app.mymedicaldaybook.co.uk` once the app has moved.
- The App Store and Google Play badges when the app is listed, with Apple's credit line in the footer.
- Cloudflare Web Analytics (private, no cookies) if Mark wants visitor numbers.
