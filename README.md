# Camp Impact Country Club

A dead-simple scorekeeper for the 18-hole soccer golf course at Camp Impact.

Open `index.html` — that's the whole app. No build step, no install, no network
needed once the page is loaded. Works offline on a phone in the middle of a field.

## How it works

1. **Who's playing** — type a name, hit enter, repeat. Tap a name to fix a typo,
   `×` to remove someone. Then **Start Round**.
2. **Play** — one hole at a time. The hole number, its par, and the max score are
   at the top; each player gets a row of tappable score buttons. Tap a number to
   record it, tap it again to clear it. **Next Hole** unlocks once everyone on the
   hole has a score. The `‹` `›` arrows jump back and forth freely.
3. **Scorecard** — live leaderboard (sorted by score to par) plus the full grid
   with OUT / IN / total. Tap any cell to jump back to that hole and fix it.

Scores save to the browser automatically, so closing the tab or locking the phone
doesn't lose the round. Reopening drops you back on the first unfinished hole.

## Rules baked in

- **Max score is double par** on every hole — the buttons simply stop there, with
  the top one marked `MAX`.
- Par is marked on the button for each hole so you don't have to remember it.

## The course

| Hole | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | Out | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | In | Total |
|------|---|---|---|---|---|---|---|---|---|-----|----|----|----|----|----|----|----|----|----|----|-------|
| Par  | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 5 | 5 | 37  | 3  | 4  | 5  | 3  | 4  | 5  | 3  | 3  | 5  | 35 | 72    |

Pars are editable — open **Course pars** on the first screen if a hole gets moved.
Editing a par down also pulls any already-entered score back under the new max.

## Hosting it

Any static host works. For GitHub Pages: Settings → Pages → deploy from this
branch, root folder. Then bookmark the URL on everyone's phone.
