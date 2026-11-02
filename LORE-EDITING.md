# Editing the Lore book

Only edit `dist/lore-content.js` for the story. Put new images in `dist/lore-art/`.
There is no editor inside the website, and no rebuild is needed. Save and refresh your local preview. Do not run build.mjs: it can overwrite unrelated manual page changes.

## How the file is arranged

- `loreSettings`: cover title (two lines), subtitle, small cover heading, illustration-page heading, and music path.
- `loreChapters`: chapters in reading order.
- Each chapter has a `title` and a `pages` list, even if it has only one page.
- Each page is one turn of the book: its illustration area and its story area together. It has `place`, `art`, and `paragraphs`.
- Each quoted entry in `paragraphs` becomes a separate paragraph. Text is plain text, not HTML or Markdown.

## Change text

Find the relevant chapter and paragraph in `dist/lore-content.js`, then edit the words inside its double quotes. Apostrophes are fine. For quotation marks inside a paragraph, write `\"` (one backslash followed by the quote). Keep commas between entries. Do not remove the surrounding brackets.

## Add a page to a chapter

Copy one complete page object inside that chapter's `pages` list. Paste it after the preceding page, with a comma between the two objects. Replace its content. Example page:

```js
{
  "place": "Riverwood",
  "art": [
    {
      "src": "lore-art/Riverwood.png",
      "alt": "A drawing of Riverwood.",
      "caption": "Riverwood"
    }
  ],
  "paragraphs": [
    "Your first paragraph goes here.",
    "Your next paragraph goes here."
  ]
}
```

The image must actually exist at `dist/lore-art/Riverwood.png`. Paths are relative to `dist`, use `/`, and must match filename capitalization exactly on GitHub. PNGs remain PNGs, including transparency.

## Add a chapter

Copy a complete `{ "title": ..., "pages": [...] }` chapter inside `loreChapters`. Change its title and page contents. Separate chapters with commas. Move a whole chapter or page object to change its reading order; delete the whole object to remove it. Keep at least one chapter and one page per chapter.

Chapter numbers, page totals, cover chapter count, previous/next buttons and image preloading update automatically. Only the first page of each chapter gets the large opening letter and title. Continuation pages use the small title in the header. Only the last page of each chapter gets the ending sparkle.

## Images

Each page's `art` list holds its own pictures. Add another `{ "src": ..., "alt": ..., "caption": ... }` entry to show another picture on that page. They appear in list order and alternate image/name sides in the stacked layout. One or two images per page gives them the most room; use extra pages for larger collections.

- `src`: image path.
- `alt`: description used by screen readers.
- `caption`: visible name below/beside the image; use `""` for no caption.
- Optional `"fit": "contain"` shows the whole image without cropping. `"fit": "cover"` fills its space and may crop. Omit it to keep the existing art layout.
- Use `"art": []` for a page without pictures; it shows the existing mountain emblem.
- `place` is the small label beneath the art; use `""` to omit it.

You do not need to edit an image list in any other file. The cover emblem and page-turn animation stay in the display code.

## Check before publishing

From the birthday-sky project folder, run:

```powershell
node tools/check-lore.cjs
```

It checks the content structure and missing image/music files, with chapter/page locations for errors. Then open the local preview, open Lore and turn through your changed pages to check how the text and pictures fit. Long text scrolls; it does not automatically create a new page.

For the live site, upload the edited `dist/lore-content.js` and any new files in `dist/lore-art/` to those same paths on GitHub. Existing images do not need to be uploaded again. GitHub Pages deploys after the commit. This new modular version must be published first before relying on its automatic behavior on the live site.
