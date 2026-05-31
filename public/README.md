# Optional: add a royalty-free background video

The home hero will automatically use a video named **`hero.mp4`** placed in this
`public/` folder. If no file is here, it falls back to the built-in animated
network (which looks great and is lighter), so this step is completely optional.

## How to add one (free, legal, no attribution)

1. Go to a royalty-free stock video site:
   - **Coverr** — https://coverr.co/  (no sign-up, no attribution)
   - **Pexels Videos** — https://www.pexels.com/videos/
   - **Mixkit** — https://mixkit.co/free-stock-video/
2. Search for something abstract and dark, e.g.:
   `abstract dark particles`, `network lines dark`, `data grid black`,
   `ink in water`, `smoke black background`.
3. Download the **HD (1080p)** version — not 4K. 4K files are huge and will slow
   the page down. Aim for a file **under ~10 MB** and a short loop (5–15s).
4. Rename the downloaded file to exactly **`hero.mp4`** and put it in this
   `public/` folder.
5. Redeploy (or just refresh during local dev). Done.

The app already converts it to black-and-white, dims it, loops it muted, and
pauses it when off-screen or when the tab isn't visible — so it stays on-brand
and fast.

## Tips for the best look (Palantir style)
- Prefer **slow, subtle motion** (drifting particles, slow lines) over busy clips.
- Darker clips blend better with the black UI.
- Keep it abstract — avoid clips with people, logos, or text.

## Want videos on other pages too?
The same component (`VideoBackdrop`) is reusable. Tell your developer (or ask
the assistant) to drop `<VideoBackdrop src="/your-clip.mp4" fallback={...} />`
into any page banner.
