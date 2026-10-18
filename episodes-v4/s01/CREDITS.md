# S01 — A Rose in the Mind Has No Thorns: preview credits

Art revision 5 uses historical paintings, botanical plates and museum photographs of real objects, composed as editable HTML motion. Source works are illustrative unless the narration explicitly identifies them. Individual artwork credits and rights are documented below. No AI-generated footage or screenshots were made for this revision. Thumbnails are editable Voyager Design documents composed from the same source artwork and channel typography.

Fonts: the channel's existing EB Garamond display faces, Cinzel and Liberation Sans Regular 2.1.5. Original font license texts are preserved in `composition/assets/fonts/licenses/`, including the Liberation Sans copyright, reserved font names and SIL OFL 1.1 in `liberation-sans-OFL.txt`.

Narration: ElevenLabs Eleven v4, using the fixed channel voice. Original music: the project's de-musica counterpoint engine, mixed with narration in REAPER. The preview contains a compressed copy of the current working mix; original lossless audio and editable sessions remain in the private production repository.

SoundFont instruments: GeneralUser GS by S. Christian Collins, rendered with SpessaSynth. The bank is not redistributed here; its License v2.0 is preserved in `../../licenses/GeneralUser_GS.txt`.

GSAP, HyperFrames and (where used) Three.js notices are described in `../../LICENSES.md`. Credits remain outside the video.

## Source production credits

# S01 — current visual and production provenance

Revision 4 is an editable HTML composition built from the six public-domain or CC0 artworks below. English narration is the original Daniel / Eleven v4 recording, retimed and mixed in REAPER revision 3 with quieter de-musica music. No new voice or video generation was performed.

Fonts: existing channel display faces and Liberation Sans, with original licenses in motion/assets/fonts/licenses/. Thumbnail artwork credits are in thumbnail/CREDITS.md. The earlier rotating rose is preserved in old revisions. Current botanical ornaments and curved directional connectors are original editable SVG penwork authored for these scenes.

Revision 4 combines acquired historical artwork images with carefully placed explanatory connectors. The complete source ledger, image hashes, actual dimensions, editorial crop suggestions and museum metadata snapshots are in `research/art-v4-sources.json` and `research/art-v4-source-records/`. Source images remain in `motion/assets/art-v4/`. An independent vector mask removes the botanical plate's paper and lettering without repainting or regenerating the source flower.

- **Provence or French Rose**, 1817–1824, catalogue attribution Henri Joseph Redouté; Cleveland Museum of Art, 1943.139. CC0. [Museum record](https://www.clevelandart.org/art/1943.139). The plate is inscribed *Rosa Gallica agatha (Varietas parva violacea)* and signed P. J. Redouté; that difference from the catalogue attribution is retained in the ledger. The full museum TIFF was converted to a 4331 × 5861 JPEG without cropping or repainting.
- **Roses and Lilies**, 1888, Henri Fantin-Latour; Metropolitan Museum of Art, 2001.202.4. CC0, 2879 × 3722. [Museum record](https://www.metmuseum.org/art/collection/search/437996). The lower roses provide the rose-specific detail; the lilies are not relabeled as roses.
- **The Reader**, Eglon van der Neer; Metropolitan Museum of Art, 32.100.9. CC0, 2848 × 3850. [Museum record](https://www.metmuseum.org/art/collection/search/437193). Used as an illustrative human subject reading and reflecting; the sitter is not identified as Diego Mas.
- **Study of a Woman's Head and Hands**, ca. 1717, Antoine Watteau; Metropolitan Museum of Art, 2012.150.1. CC0, 1321 × 1993. [Museum record](https://www.metmuseum.org/art/collection/search/408989).
- **Study of a Young Woman**, ca. 1665–67, Johannes Vermeer; Metropolitan Museum of Art, 1979.396.1. CC0, 3454 × 3866. [Museum record](https://www.metmuseum.org/art/collection/search/437879). Used as a painted gaze, without changing the sitter's expression or inventing an identity.
- **The Artist's House at Argenteuil**, 1873, Claude Monet; Art Institute of Chicago, 1933.1153. Public-domain faithful reproduction, 3000 × 2440. [Museum record](https://www.artic.edu/artworks/16554/the-artists-house-at-argenteuil). Acquired through the [Commons copy credited to the museum](https://commons.wikimedia.org/wiki/File:Claude_Monet_-_The_Artist%27s_House_at_Argenteuil_-_1933.1153_-_Art_Institute_of_Chicago.jpg); the museum API marks the artwork public domain. The garden is an illustrative setting, not a reconstruction of Diego Mas's surroundings.

No media generation, paid search, screenshots or audio changes were used for this image acquisition. Attribution remains in the repository, outside the picture.

## V5 — four refinement rounds and articulated source layers

The source paintings remain byte-for-byte unchanged. Editable masks, source dimensions, original hashes and pivots are recorded in `composition/assets/art-v4/s01-cutout-layers-v5.json`. The rose uses one stable stem/base and five moving parts: main flower, two buds and two leaf groups. Their union preserves the source silhouette and their static partition avoids duplicated petals. The Vermeer and Van der Neer figures use individual source-aligned silhouette masks; faces and hands are not deformed.

The lower/front page of the reader's book is isolated below the hand and articulated by less than one degree about its visible gutter. This vector-only treatment is recorded in `composition/assets/art-v4/s01-reader-layers-v5.json`; the original painting and the full-subject mask are preserved. It is an editorial illustration, not newly recorded or AI-generated footage of a person reading. Botanical penwork and explanatory connectors are original composition elements. Credits remain outside the composition. Narration, music and all six scene timings are unchanged.
