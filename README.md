# Stickfigure Storyboarder

A relaxed storyboard maker built with plain HTML, CSS, and JavaScript. No frameworks, libraries, or build step.

## Use it

Open `index.html` in a modern browser, or serve this folder with a static web server:

```sh
python3 -m http.server 8000
```

Visit http://localhost:8000.

## Make a story

1. Draw a background and add a stick figure.
2. Press **Record movement**, drag the character, then **Stop recording**.
3. Pick another character and record again. Earlier recordings play along; wait for their turn, then drag the new character in.
4. Press **Rewatch** to see the recorded parts together.
5. Add and reorder scenes, then stitch the full story together.
6. Use **Export Video** in the top-right corner to download an MP4.

Projects are saved in this browser's local storage. Save Project downloads a JSON backup. MP4 export requires a browser with MP4 MediaRecorder support; keep the tab visible during export. Export runs in real time and produces silent video.

## Files

- `index.html`: app interface
- `style.css`: responsive styling
- `app.js`: drawing, characters, movement tracks, scenes, and playback
- `export.js`: full-timeline MP4 export
