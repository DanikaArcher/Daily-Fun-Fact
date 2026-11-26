# Daily Deck

One fun fact a day for 54 days, drawn from a freshly shuffled deck of cards. Built to open from an NFC tag.

## How it works

- Each phone starts its own deck on its first visit. A new card unlocks every 24 hours after that.
- The deck order is a fixed shuffle (`SHUFFLE_SEED` in `app.js`), the same on every phone.
- Missed days can be opened from **Past cards** under the revealed card.
- After day 54 only the "Congrats! You've finished this deck!" message is shown.
- Progress is stored in the phone's browser (localStorage). Clearing browser data restarts the deck.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page |
| `styles.css` | Colours, layout, card design |
| `app.js` | Shuffle animation, day counting, reveal, archive |
| `art.js` | The simple drawing for each card |
| `deck.csv` | The 54 facts (edit this to change them) |

## Using your own card art

Add an `Image` column to `deck.csv` and put a file path or URL in it for any card, for example `art/AH.png`.
Put the image files in an `art/` folder next to `index.html`. Cards with no image keep their drawing.
A wide image (16:9, e.g. 1600 × 900) fits the picture area best.

## Demo controls

Open the site with `?demo` on the end of the address (e.g. `…/daily-deck/?demo`) to show buttons for
replaying, changing day and resetting. Visitors never see them.

## Hosting on GitHub Pages

1. Create a new **public** repository on github.com (e.g. `daily-deck`).
2. Upload every file in this folder (Add file → Upload files), or push it with git.
3. In the repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   choose `main` and `/ (root)`, then **Save**.
4. After a minute the site is live at `https://<your-username>.github.io/daily-deck/`.
5. Write that address to the NFC tag as a **URL / URI record** (NFC Tools on iOS or Android does this).
