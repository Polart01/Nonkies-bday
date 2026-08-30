# Nonkie's Birthday Surprise

A dependency-free birthday memory website made with plain HTML, CSS and JavaScript. It can be hosted free on GitHub Pages.

The included manifest is already prepared for the 98 photo filenames and five music filenames supplied for Nonkie's site. The actual photo and audio files remain in your phone's `assets/photos` and `assets/music` folders; push those folders together with this code for them to appear online.

## Full-screen photo booth

After the gift opens, select **Open Our Photo Booth**. The booth displays one complete photograph at a time and advances every five seconds. Tap the photo or use the arrow buttons to move manually; use the centre button to pause or resume. Keyboard arrows, the spacebar and mobile swipes are supported.

Photographs use their natural aspect ratio with `object-fit: contain`, so portrait, landscape and square images are shown completely instead of cropping faces or bodies. Only the current and next images are loaded for the slideshow, which keeps large collections responsive. Change `slideDuration: 5000` near the top of `script.js` to adjust the timing.

The website is locked to the visible browser viewport using responsive `dvh` sizing, safe-area insets and fixed full-screen sections. It does not require page scrolling on a phone, tablet or laptop. When a photo's shape does not match the screen, a blurred copy of that same photo fills the surrounding area while the sharp main photo remains completely visible and uncropped.

## Quick start

1. Put photographs in `assets/photos/`.
2. Put music in `assets/music/`.
3. Run `python3 generate-manifest.py` (Windows also accepts `py generate-manifest.py`).
4. Start a local server with `python3 -m http.server 8000`.
5. Open `http://localhost:8000` in a browser.

Do not preview by double-clicking `index.html`: browsers often block loading the JSON manifest from `file://` pages.

## Naming and chronological order

Name photographs like this:

```text
YYYY-MM-DD-short-caption-001.jpg
2023-02-14-our-first-valentine-001.jpg
2024-08-30-birthday-together-001.jpg
```

The generator extracts the date and caption, then sorts from oldest to newest. Photos without a date appear last under “More beautiful memories.” Files sharing a date are sorted by their final number.

WhatsApp image names such as `IMG-20260425-WA0043.jpg` are also recognised automatically. They are dated as `2026-04-25` and receive a simple caption such as “Our Memory #0043,” so you do not have to rename the photographs from your phone.

## Adding many photographs

The site renders 30 photos at a time and lazy-loads images, so it does not create 6,200 page elements at once. Still, 6,200 full-size phone photos can use tens of gigabytes and exceed practical GitHub repository or Pages limits. Compress them before uploading and consider keeping only the best memories.

Recommended workflow:

- Export display copies as WebP, around 1600–2000 pixels on the longest side.
- Aim for roughly 200–500 KB per display image.
- Optionally create small versions with the same filename in `assets/photos/thumbnails/`; the generator detects them automatically.
- Keep originals backed up elsewhere. GitHub Pages is a website host, not a photo backup service.
- Split an extremely large collection across multiple repositories or another static-file host if the repository becomes too large.

## Adding music

Place browser-compatible `.mp3`, `.m4a`, `.ogg`, `.wav`, or `.aac` files in `assets/music/`, then regenerate the manifest. The filename becomes the song title. Music begins only after the gift is clicked because modern browsers block unrequested autoplay.

WhatsApp audio names such as `AUD-20260424-WA0041.mp3` are cleaned into readable playlist titles. Bitrate endings such as `(128k)` and repeated underscores are also removed from displayed song titles; the actual files are not renamed.

Only upload audio you have permission to publish. A public GitHub repository makes its files downloadable.

## Editing the message, date and effects

Open `script.js` and edit the `CONFIG` object at the top. The unlock value currently uses South African time:

```js
unlockDate: "2026-08-30T00:00:00+02:00"
```

Edit `recipientName`, `title`, `heartfeltMessage`, `batchSize`, decoration colours, or particle limits in the same place.

## Automatic decorations

No decoration downloads are required. The website builds its gift, ribbons, balloons, bubbles, hearts, sparkles, petals, confetti, flowers, leaves, fairy lights, birthday cake, wall ornaments and love-note cards using HTML, CSS, JavaScript and inline SVG.

Every decoration type can be switched on or off inside `CONFIG.decorations` in `script.js`. You can also edit the colour palette, love-note messages and separate mobile/desktop particle limits there. Temporary effects delete themselves after the animation, background animation pauses when the tab is hidden, and visitors can use the low-motion button.

## Uploading to GitHub Pages

1. Create a new GitHub repository.
2. Upload the contents of `birthday-surprise` to the repository root.
3. Commit the files.
4. Open the repository’s **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select your main branch and the `/ (root)` folder, then save.
7. GitHub will show the public website address after deployment.

All paths are relative, so the site works under a repository address such as `username.github.io/birthday-surprise/`.

## Important privacy and security limits

This is a static website. The countdown hides the interface until the configured time, but it is not tamper-proof. Someone can change their device clock, inspect the source, or directly browse publicly stored files. Do not upload anything that must remain truly secret or private.

If the repository and Pages site are public, every photo and song is public. GitHub Pages does not provide a simple private-password lock for this project.

## Troubleshooting

- **No pictures or music:** Run the manifest generator again, commit `media-manifest.json`, and check filename capitalization.
- **The manifest fails locally:** Use a local web server; do not open the HTML using `file://`.
- **A picture is blank:** Check that its extension is supported and that the filename in the manifest matches exactly.
- **Music does not start automatically:** Click the gift or Play button. Browser autoplay rules require a user action.
- **GitHub shows a 404:** Confirm Pages is enabled for the correct branch and root directory. Deployment can take a few minutes.
- **The page feels slow:** Compress images, add thumbnails, reduce `batchSize`, or enable low-motion mode.
- **The gift unlocked during testing:** In the browser console run `localStorage.removeItem("nonkieBirthdayUnlocked")`, then reload. To test a future lock, temporarily set a future `unlockDate`.

## Folder notes

The `assets/decorations/` directory may stay empty. The balloons, bubbles, hearts, sparkles, bow, frames and fairy lights are generated with CSS and JavaScript, so no subscription or decoration download is needed.
