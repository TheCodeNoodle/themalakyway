# The Malaky Way

Local-only: keep future changes on this computer. The page opens directly onto the full-viewport sky with the discovery controls at the bottom. Both SVG layers scale together to cover the screen at their original aspect ratio. Drag the sky to reach artwork and stars outside the viewport; touch scrolling and keyboard focus also reveal them.

The normal cursor is restored. A 128px character floats above the bottom controls using four PNG frames extracted from the supplied GIF. It holds frame 0, then blinks every 5–9 seconds (12–18 seconds with reduced motion). Floating movement is reduced to 4px under reduced motion. Star transitions last 350ms, or a brief 120ms fade with reduced motion.

Open `dist/index.html` directly, or run `node serve.mjs` and visit http://127.0.0.1:4173.

The leftmost star is Disco, a ten-song music guessing game. Disco, Fortune, and Museum occupy the first three stars. The fourth star opens On This Day, a three-page scrapbook. Edit the remaining three messages and the final birthday wish in `dist/surprises.js`. The stars are ordered left to right. Discovery progress resets when the page reloads.

Keep this website local, as requested. No backend or login is required.

Both supplied SVGs have dimensions 167 × 94 with no viewBox. Identical outer SVG wrappers use `viewBox="0 0 167 94"`; the nested original coordinate systems remain unchanged. The sky contains 15,698 rectangles. Connected-component extraction identifies seven alternate stars of 13 rectangles each. Their original coordinates and colors are preserved. Hit rectangles derive from each component's bounds plus one source pixel of padding. Only those individual rectangles receive pointer events.

`node build.mjs` regenerates `dist/index.html` from `template.html` and the two original SVGs in the parent directory. CSS and editable content live directly in `dist`. Original artwork stays in the parent directory; only optimized runtime artwork is included in dist. On narrow screens the composition covers the viewport; dragging and keyboard focus reveal stars outside its edges.

The current scene uses `Sky Background.svg`, `Moving Clouds.svg`, and `Bottom Cloud.svg` from the parent folder. Run `node build.mjs` after replacing artwork. The sky and interactive stars share their original coordinates; the moving clouds drift above them and the bottom cloud is the foreground. Pointer movement and sky dragging offset the two cloud layers at different speeds. Reduced motion uses slower cloud drift and smaller parallax offsets.

The build identifies 56 isolated dim dots from the sky's actual pixels, excluding the surprise stars and large background shapes. Their brighter overlay colors come from the supplied sky palette and fade in and out on staggered schedules.


Rendering optimization: build.mjs creates compact SVG image files by merging adjacent same-color pixels into paths, and verifies every pixel against the originals. Static artwork is loaded as image layers; only the seven interactive stars remain inline SVG. The sky uses 232 live DOM elements instead of 18,399. Twinkles are small opacity-animated elements with a cached glow, with staggered 5–10-second cycles that remain visible under reduced motion. Parallax updates only the two cloud transforms once per frame; animations pause when the tab is hidden. No original artwork files are modified.

Opening scene: every fresh page load starts with the astronaut transmission in `dist/intro.js`. All 12 supplied passages require a click, tap, or keyboard activation. Long passages paginate at word boundaries on small screens. After passage 9, a single simulated flash reveals the supplied license with a slight tilt; it stays until the visitor clicks. Passages 10–12 then finish the introduction and enable the original sky, character, surprises, and shooting stars. No camera permission or recording is involved. The introduction is intentionally replayed on reload.

The new source artwork is `astronaut dialogue.svg` and `Driver Licence.svg` in the parent directory. `node build.mjs` generates compact render copies with exact pixel-color verification. The dialogue uses a viewport around its nontransparent artwork; its original pixels and avatar placement are preserved.

Audio: click to receive the opening transmission and enable sound. `dist/scene-audio.js` plays the supplied letter WAV on each typed letter/number and the closing WAV once at the end of each complete passage. Skipping typing stops letter sounds before the ending cue. The supplied Moonlight Jellies track loops softly, pauses while Disco is open or the tab is hidden, and resumes at its saved position. The Music button toggles background music. All audio is local; embedded WAV data keeps effects compatible with opening index.html directly.

Disco: `dist/disco.js` and `dist/disco.css` implement the pixel music window. Each round plays one of ten numbered 15-second MP3 clips under `dist/music`. Three different incorrect guesses reveal the title for 4.5 seconds, then advance; the Next button can advance sooner. Correct answers wait for Next. Empty and repeated guesses do not cost hearts. Closing pauses playback and preserves this session's round; reload resets the game. The final playlist preserves the requested order, with no explicit hidden-name reveal. Song-name matching ignores punctuation/case and tolerates small typos.

Song suggestions are bundled locally in `dist/song-catalog.js` (editable source: `tools/song-catalog.json`); provenance is in `dist/SONG-DATA-SOURCES.md`. They filter locally, including with file://. Clip start times are editable in `tools/disco-clips.json`; regenerate with `tools/prepare-disco.py clips` using the bundled Python environment and `.tools/python` audio utility. Clips are selected around chorus/refrain sections using timing references; different video edits can shift their exact starts.

Disco artwork: dist/disco-art contains compact SVG copies of the supplied windows assets, cropped only to remove transparent padding. The layout uses their original 167 x 128 coordinates. Buttons brighten and lift on hover, depress on click, and retain keyboard focus outlines; reduced-motion mode omits movement. Hearts hold frame 1 by default. Each wrong guess moves one heart through frame 2 for 100ms, then holds frame 3. A new round resets all hearts. The finale scrolls inside the same artwork frame.

Fortune: the second star opens a window using the shared pixel frame/buttons and the supplied crystal ball, candles, and dialogue frame (dist/fortune-art). The ball glows on hover or keyboard focus. Clicking it begins six exact predictions with typewriter sounds, click-to-reveal, and word-boundary pagination. Hear It Again restarts them. The local Wizard's Theme loops only while Fortune is open; closing restores the sky soundtrack, and Disco still pauses scene music.

Fortune table update: window-table.svg and dialogueFrame.svg use the new artwork from Desktop/witcher. The original ball sits with its base over the central table shadow; side-crystal.svg decorates both outer edges, and candle-new.gif supplies the animated candles.

Museum: the third star opens the supplied 181 x 135 room with four interactive exhibit layers positioned at their original coordinates. Hover/focus glows and labels use only the supplied exhibit names. Selecting an exhibit opens its separate full artwork, including Downloads/Demnate.svg; the close icon or Escape returns to the room before closing the Museum. Golden Star music is local, loops only in this window, and restores sky music on exit. Compact SVG generation verifies every source pixel and color.

File optimization: `tools/optimize-assets.py` losslessly merges pixel SVG paths and verifies their pixel coordinates. Unused source copies, legacy animation frames, duplicate WAV files (effects remain embedded), and generated preview screenshots have been removed. The original user artwork and audio are preserved outside this project. Keep `.tools/python` for regenerating music clips.
