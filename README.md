# Camp Impact Country Club

A dead-simple scorekeeper for the 18-hole soccer golf course at Camp Impact.

Open `index.html` — that's the whole app. One file, no build step, no install.
Works on a phone in the middle of a field.

**Hosted copy:** https://claude.ai/artifact/1TCSVFYNUVhuA77GpVHNu2 (private until
it's shared from the page's Share menu).

## How it works

1. **Who's playing** — type a name, hit enter, repeat. Tap a name to fix a typo,
   `×` to remove someone. Then **Start Round**.
2. **Play** — one hole at a time. The hole number, its par, and the max score are
   at the top; each player gets a row of tappable score buttons. Tap a number to
   record it, tap it again to clear it. **Next Hole** unlocks once everyone on the
   hole has a score. The `‹` `›` arrows jump back and forth freely.
3. **Scorecard** — live leaderboard (sorted by score to par) plus the full grid
   with OUT / IN / total. Tap any cell to jump back to that hole and fix it.
4. **Rules** — the full house rules, always one tap away from the bottom nav (and
   from a button on the first screen, for the pre-round briefing).

Scores save to the browser automatically, so closing the tab or locking the phone
doesn't lose the round. Reopening drops you back on the first unfinished hole.

## The rules

Written out in full on the **Rules** screen in the app. In brief:

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

## The course

| Hole | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | Out | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | In | Total |
|------|---|---|---|---|---|---|---|---|---|-----|----|----|----|----|----|----|----|----|----|----|-------|
| Par  | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 5 | 5 | 37  | 3  | 4  | 5  | 3  | 4  | 5  | 3  | 3  | 5  | 35 | 72    |

Pars are editable — open **Course pars** on the first screen if a hole gets moved.
Editing a par down also pulls any already-entered score back under the new max.

## Hosting it

Any static host works. For GitHub Pages: Settings → Pages → deploy from this
branch, root folder. Then bookmark the URL on everyone's phone.

`make-artifact.py` builds the Claude-hosted copy from the same `index.html` by
stripping the outer `<html>`/`<head>`/`<body>` wrapper, which that platform
supplies itself:

```
python3 make-artifact.py artifact.html
```

Edit `index.html` only — the hosted page is generated from it, never edited
separately.
