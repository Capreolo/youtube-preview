# Canal de Filosofia — five working previews

Static review site for the channel's first episodes:

| Episode | Title | Screen | Current duration |
| --- | --- | --- | --- |
| F1 | What Is Philosophy? | 16:9, 1920 × 1080 | 6:38 |
| C1 | Analogy: From Proportion to Being | 16:9, 1920 × 1080 | 6:57 |
| O0 | The Architecture of Saint Thomas Aquinas’s Works | 16:9, 1920 × 1080 | 7:00 |
| PS01 | Thales of Miletus: Why Water? | 16:9, 1920 × 1080 | 6:53 |
| S01 | A Rose in the Mind Has No Thorns | 9:16, 1080 × 1920 | 0:44 |

These are live HTML compositions for review, not final exported MP4s. Narration is in English. Each episode includes its current narration/music mix and YouTube thumbnail.

## Watch on a phone

Open the GitHub Pages site, choose an episode and tap the player's play button. Playback starts only when you tap. The native controls provide pause, seeking, sound and fullscreen. Landscape orientation gives the four horizontal episodes more room; S01 uses a portrait canvas. Selecting another episode unloads the current player so only one soundtrack plays.

The site uses local frozen HyperFrames 0.8.145 playback code, fonts, modules and MP3 audio. There is no server-side application, account connection or build step. A modern browser supporting JavaScript, ES modules and WebGL is needed for the Three.js rose scenes.

## Local static serving

From this directory:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open http://127.0.0.1:8000/ in a browser. Keep all paths relative when deploying to GitHub Pages. The `.nojekyll` file disables Jekyll processing.

Production sources, book corpus, original lossless audio, editable sound sessions, credentials and caches are not part of this review site. Credits and dependency notices are repository-only documents in `LICENSES.md`, `licenses/`, and each episode's `CREDITS.md`; they do not appear in the video.
