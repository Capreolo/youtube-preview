# S01 — current visual and production provenance

The current revision 6 uses one continuous stage: the channel's existing procedural 3D rose, one masked painting of an attentive reader, and original editable SVG marginalia, garden soil/roots and explanatory relations. The previous botanical plate and the other five-image montage are preserved in the project history; they are not the current video artwork. Thumbnail credits remain separately in `thumbnail/CREDITS.md`.

English narration remains the original Daniel / Eleven v4 recording, retimed and mixed in REAPER revision 3 with the existing de-musica score. The V6 visual work did not generate or alter voice, music, script or the 58-second timing. No paid generation, screenshots or video renders were used for these V6 assets and their source audit.

## Current V6 artwork

- **Canonical 3D rose:** existing project-authored procedural geometry from `youtube/diego-mas/assets/rose-world.mjs`, reused by the user's explicit instruction. The extracted canonical segment is unchanged; the existing S01 V3 recurved prickles are retained. Local geometry: `motion/assets/s01-rose-geometry-v6.mjs`; source hashes and numerical verification: `research/s01-v6-rose-3d-provenance.json` and `research/s01-v6-rose-3d-qa.json`. No separately downloaded model or raster texture is used. This reuse does not assign a new public license to project-authored art.
- **The Reader**, Eglon van der Neer; Metropolitan Museum of Art, 32.100.9. CC0, 2848 × 3850. [Museum record](https://www.metmuseum.org/art/collection/search/437193), [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Museum metadata is preserved in `research/art-v4-source-records/met-437193.json`. The JPEG is byte-for-byte unchanged. It depicts an illustrative attentive reader, not Diego Mas; the book is not presented as a primary-text facsimile or direct quotation. V6 masks remove the wall, chair and table, preserve the painted face and hands with the body, and feather only the truncated lower clothing. The original front page below the fingers is a separate vector-masked layer; its documented movement is limited to ±0.35° about the visible gutter, with an 8-source-pixel band of original paper beneath the moving edge. Masks, coordinate anchors, source hash and integration notes: `motion/assets/art-v6/observer-reader.json`.
- **Botanical marginalia:** original project-authored SVG in `motion/assets/art-v6/marginalia.svg`, with 32 paths in two open corners. Copper, gold and green linework; transparent field, no frame or lettering. It is a new decorative drawing, not a historical facsimile.
- **Garden ground:** original project-authored SVG in `motion/assets/art-v6/garden-ground.svg`, with 37 paths for soil, stem junction and branching roots. Transparent field; no imported background image.
- **Explanatory relations:** original editable SVG paths integrated in `motion/index.html`. Their connectors and partial marks explain relations; they do not depict material particles, a plant travelling into a head, or a second miniature material rose.

The observer is reserved for two portions of the composition and does not remain throughout the Short. Facial features, fingers and the sitter's identity are not regenerated or independently deformed. Credits remain outside the picture.

## Fonts and local libraries

Existing channel display faces and Liberation Sans retain their original licenses in `motion/assets/fonts/licenses/`. The existing local GSAP is retained. Three.js is self-hosted in `motion/assets/vendor/`; its MIT/SPDX source headers are preserved. V6 introduces no new font, downloaded image, model or texture.

## Archived V4–V5 image credits

The records below document earlier revisions and retained source files. Only **The Reader** is an active painting in the current V6 video. The complete acquisition ledger and museum metadata snapshots remain in `research/art-v4-sources.json` and `research/art-v4-source-records/`; historical V5 masks remain in `motion/assets/art-v4/`.

- **Provence or French Rose**, 1817–1824, catalogue attribution Henri Joseph Redouté; Cleveland Museum of Art, 1943.139. CC0. [Museum record](https://www.clevelandart.org/art/1943.139). The plate is inscribed *Rosa Gallica agatha (Varietas parva violacea)* and signed P. J. Redouté; that difference from the catalogue attribution is retained in the ledger. The full museum TIFF was converted to a 4331 × 5861 JPEG without cropping or repainting.
- **Roses and Lilies**, 1888, Henri Fantin-Latour; Metropolitan Museum of Art, 2001.202.4. CC0, 2879 × 3722. [Museum record](https://www.metmuseum.org/art/collection/search/437996). The lower roses provide the rose-specific detail; the lilies are not relabeled as roses.
- **The Reader**, Eglon van der Neer; Metropolitan Museum of Art, 32.100.9. CC0, 2848 × 3850. [Museum record](https://www.metmuseum.org/art/collection/search/437193). Used as an illustrative human subject reading and reflecting; the sitter is not identified as Diego Mas.
- **Study of a Woman's Head and Hands**, ca. 1717, Antoine Watteau; Metropolitan Museum of Art, 2012.150.1. CC0, 1321 × 1993. [Museum record](https://www.metmuseum.org/art/collection/search/408989).
- **Study of a Young Woman**, ca. 1665–67, Johannes Vermeer; Metropolitan Museum of Art, 1979.396.1. CC0, 3454 × 3866. [Museum record](https://www.metmuseum.org/art/collection/search/437879). Used as a painted gaze, without changing the sitter's expression or inventing an identity.
- **The Artist's House at Argenteuil**, 1873, Claude Monet; Art Institute of Chicago, 1933.1153. Public-domain faithful reproduction, 3000 × 2440. [Museum record](https://www.artic.edu/artworks/16554/the-artists-house-at-argenteuil). Acquired through the [Commons copy credited to the museum](https://commons.wikimedia.org/wiki/File:Claude_Monet_-_The_Artist%27s_House_at_Argenteuil_-_1933.1153_-_Art_Institute_of_Chicago.jpg); the museum API marks the artwork public domain. The garden is an illustrative setting, not a reconstruction of Diego Mas's surroundings.

The archived Redouté anatomical masks and the Vermeer, Watteau, Monet and Fantin-Latour imagery are not used by the current V6 stage. Their retention does not make them new or exclusive artwork. Source attribution belongs to this repository and the separate thumbnail ledger, never to an on-screen credit.
