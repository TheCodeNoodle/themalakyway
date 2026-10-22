# Lore artwork

The four chapters live in `../lore-content.js`. Their `art` arrays accept any number of illustrations. Keep the story text in `paragraphs` and add pictures separately:

```js
art: [
  {src: 'lore-art/paarthurnax.png', alt: 'Paarthurnax, the ancient dragon.', caption: 'Paarthurnax'},
  {src: 'lore-art/mountain.png', alt: 'The snowy mountain summit.', caption: 'The Throat of the World'}
]
```

Place new image files in this folder. The book automatically offers numbered picture selectors when a chapter has multiple pictures. An empty art array uses the decorative mountain drawing. Images retain their proportions. The original supplied Paarthurnax PNG is preserved unchanged.

No build step is needed. Do not run the old build script over manually edited page files.
