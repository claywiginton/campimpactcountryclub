# Camp Impact Country Club

A scorekeeper for the 18-hole Fußballgolf course at Camp Impact.

**The interface is entirely in German** — the players are, so the app is. This
README stays in English for whoever maintains it.

Open `index.html` — that's the whole app. One file, no build step, no install.
Works on a phone in the middle of a field.

**Live site:** https://claywiginton.github.io/campimpactcountryclub/ — served by
GitHub Pages from `main`. There is also a Claude-hosted copy at
https://claude.ai/artifact/1TCSVFYNUVhuA77GpVHNu2, built by `make-artifact.py`.

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

## Offline

A service worker (`sw.js`) caches the whole app on the first visit, so after
that it opens **with no connection at all** — the page, the icons and the
manifest all come from the phone. The scorecard makes no external requests of
any kind, so once it has loaded once, signal stops mattering for the rest of
the round.

The cache is served first and refreshed in the background, so a newly deployed
version appears on the launch *after* the one that downloaded it. That is the
right trade for a field: never a spinner, at the cost of being one launch
behind. Bump `CACHE` in `sw.js` to purge old copies.

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

Tuned for one hand, in daylight, on a phone — everything that did not serve that
is gone.

- **No downloaded fonts.** The system font stack renders instantly and the page
  makes *zero* network requests. Together with the service worker, that means
  the round never touches the network at all.
- **No dead-end buttons.** Tapping *Runde starten* with nobody entered says so
  and focuses the name field, instead of a greyed-out button that ignores you;
  tapping *Nächstes Loch* with a score missing scrolls to that player and
  marks their card.
- **Nothing tappable under 48px.** Score buttons are 58px tall; so are the hole
  arrows, the name field and the nav.
- **One fixed score grid, six columns, on every hole.** A given number is always
  the same size in the same place, whatever the par, so entering a score is
  muscle memory rather than a fresh search each hole. A par 3 fills one row,
  a par 4 or 5 wraps to a second.
- **The banner is one 47px line** — flag mark, club name, nothing else — and
  only on the player screen. The whole title screen fits without scrolling;
  during play the screen belongs to the scoring.
- **Hole and par stay pinned** to the top while you scroll the players.
- **The screen stays awake** while the play screen is open, so the phone does
  not lock between holes.
- Plain sentence case, not letterspaced capitals — faster to read at a glance.
- High-contrast text on near-white or near-black, in both themes.

What survived is what carries information: the green tee plate that identifies
the hole at a glance, the par marking on each score button, and the circled /
boxed scores on the card.

## The course

| Hole | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | Out | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | In | Total |
|------|---|---|---|---|---|---|---|---|---|-----|----|----|----|----|----|----|----|----|----|----|-------|
| Par  | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 5 | 5 | 37  | 3  | 4  | 5  | 3  | 4  | 5  | 3  | 3  | 5  | 35 | 72    |

The course is fixed: pars are built into the app and can't be changed from the
scorecard, so every round is scored against the same 72. Changing the course
means editing `DEFAULT_PARS` in `index.html`.

## Hosting it

Live at **https://claywiginton.github.io/campimpactcountryclub/**

**GitHub Pages** is the whole deployment story — the repo is public and
`index.html` sits at the root, so there is nothing to build. It is configured
as Settings → Pages → Source: **Deploy from a branch** → Branch: `main` /
`(root)`. Every push to `main` redeploys the site, usually within a minute.

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
