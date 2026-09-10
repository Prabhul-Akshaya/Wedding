# Digital Wedding Invitation

A mobile-first, data-driven wedding invitation that can be deployed directly to GitHub Pages.

## 1. Customize the wedding

Normally, you only need to edit:

`wedding.json`

Change:

- couple names
- date/time
- venue/address
- Google Maps URL
- family names
- story
- events
- gallery
- RSVP
- theme colors
- music

Do not modify `index.html`, `css/style.css`, or `js/app.js` unless you want to change the design/functionality.

## 2. Replace photos

Put your photos in:

`images/`

Recommended files:

- `couple.jpg` — hero photo
- `couple-2.jpg` — large couple photo
- `venue.jpg` — venue
- `gallery-1.jpg`, `gallery-2.jpg`, etc. — gallery

You can use different filenames, but update the paths in `wedding.json`.

Use compressed JPG/WebP images where possible. For mobile performance, approximately 1–2 MB per image or less is preferable.

## 3. Optional music

Put an MP3 file in:

`assets/music.mp3`

Then change:

`"enabled": true`

in `wedding.json`.

Browsers normally block automatic audio playback. The invitation therefore uses a floating music button that visitors can tap.

## 4. Google Maps

Put the destination URL in:

`location.mapUrl`

and/or each event's:

`mapUrl`

The buttons are automatically hidden if a map URL is not provided.

## 5. RSVP / WhatsApp

Set:

`rsvp.whatsapp`

to the number including country code.

Example:

`+919876543210`

The website automatically creates a WhatsApp link.

## 6. Add/remove events

Add objects to the `events` array in `wedding.json`.

If the array is empty, the Events section is automatically hidden.

## 7. Add/remove gallery photos

Add/remove paths in the `gallery` array.

There is no hardcoded gallery size.

## 8. Theme

Change the values under:

`theme`

Example:

```json
"theme": {
  "primary": "#7A1838",
  "secondary": "#C8A24A",
  "background": "#FBF7EF",
  "surface": "#FFFDF8",
  "text": "#35251F",
  "muted": "#75655D"
}
```

## 9. Test locally

Because browsers may block `fetch("wedding.json")` when opening `index.html` directly as a `file://` URL, use a local web server.

If Python is installed:

```bash
python -m http.server 8000
```

Then open:

http://localhost:8000

Alternatively, use VS Code Live Server.

## 10. Deploy to GitHub Pages

1. Create a new GitHub repository.
2. Upload all files and folders.
3. Go to the repository's Settings.
4. Open Pages.
5. Under Build and deployment, select:
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)
6. Save.
7. GitHub will provide the public Pages URL.

The project uses relative paths, so it works under:

`https://USERNAME.github.io/REPOSITORY/`

## Important

Do not use absolute paths such as `/images/couple.jpg`.

Use relative paths such as:

`images/couple.jpg`

This is necessary for GitHub Pages repositories.
