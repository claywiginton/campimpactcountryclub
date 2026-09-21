# Camp Impact Country Club

A scorekeeper for the 18-hole Fußballgolf course at Camp Impact.

**The interface is entirely in German** — the players are, so the app is. This
README stays in English for whoever maintains it.

Open `index.html` — that's the whole app. One file, no build step, no install.
Works on a phone in the middle of a field.

**Hosted copy:** https://claude.ai/artifact/1TCSVFYNUVhuA77GpVHNu2 (private until
it's shared from the page's Share menu).

## How it works

1. **Wer spielt mit?** — type a name, hit enter, repeat. Tap a name to fix a
   typo, `×` to remove someone. The course and its pars sit below the roster.
   Then **Runde starten**.
2. **Spielen** — one hole at a time. Hole number, par and the maximum are on the
   tee plate at the top; each player gets a row of tappable score buttons. Tap a
   number to record it, tap it again to clear it. **Nächstes Loch** unlocks once
   everyone on the hole has a score. The `‹` `›` arrows move freely.
3. **Scorekarte** — a tournament board sorted by score to par, plus the printed
   card with Hin / Rück / Gesamt. Scores under par are circled, double bogey or
   worse is boxed, as on a paper card. Tap any cell to jump back and fix it.
4. **Regeln** — the full Platzregeln, one tap away from the bottom nav and from a
   button on the first screen for the pre-round briefing.

Scores save to the browser automatically, so closing the tab or locking the phone
doesn't lose the round. Reopening drops you back on the first unfinished hole.

## The rules

Written out in full on the **Regeln** screen in the app. In brief:

- **Tee off within 1 meter** of the yellow tee marker.
- **Finishing a hole** — agree on a mode before hole 1. *Easy:* hit the tire.
  *Normal:* the ball comes to rest in the tire, hits the pole, or hits the cone.
- **Play it where it lies.** The ball never gets moved. If it's genuinely
  unplayable, place it at the nearest playable point no closer to the hole and
  take a one-hit penalty.
- **One motion, one hit.** A kick, a drag, a scoop with the foot, or a pinch
  between both feet and a flick — all fine, as long as it's one unbroken motion
  touching the ball once.
- **Max score is double par** on every hole. The app enforces this: the score
  buttons stop at double par, with the last one marked `MAX`.

Par for each hole is marked right on its score button, so nobody has to remember it.

## Design

Deep turf green and brass on card stock, hairline rules instead of drop shadows.
Bodoni Moda carries the club identity and the hole numbers, Archivo the
interface, Archivo Narrow the scorecard grid. The masthead and the leaderboard
are the only two dark surfaces, so the board reads as the board. Light and dark
themes are both defined at token level; the masthead stays turf either way.

## The course

| Hole | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | Out | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | In | Total |
|------|---|---|---|---|---|---|---|---|---|-----|----|----|----|----|----|----|----|----|----|----|-------|
| Par  | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 5 | 5 | 37  | 3  | 4  | 5  | 3  | 4  | 5  | 3  | 3  | 5  | 35 | 72    |

The course is fixed: pars are built into the app and can't be changed from the
scorecard, so every round is scored against the same 72. Changing the course
means editing `DEFAULT_PARS` in `index.html`.

## Hosting it

**GitHub Pages** is the whole deployment story — the repo is public and
`index.html` sits at the root, so there is nothing to build:

> Settings → Pages → Source: **Deploy from a branch** → Branch:
> `claude/sweet-goodall-o548qw` / `(root)` → Save

That publishes to **https://claywiginton.github.io/campimpactcountryclub/**,
usually within a minute. Every push to that branch redeploys automatically.

The page ships an SVG favicon, an apple-touch-icon and a web manifest, so
"Add to Home Screen" gives a proper standalone app with the club seal on it.
Icons are generated from `icon.svg`; regenerate the PNGs if that changes.

`make-artifact.py` builds the Claude-hosted copy from the same `index.html` by
stripping the outer `<html>`/`<head>`/`<body>` wrapper, which that platform
supplies itself:

```
python3 make-artifact.py artifact.html
```

Edit `index.html` only — the hosted page is generated from it, never edited
separately.
