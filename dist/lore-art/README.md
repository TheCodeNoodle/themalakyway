# Lore artwork

The four chapters live in `../lore-content.js`. Their `art` arrays accept any number of illustrations. Keep the story text in `paragraphs` and add pictures separately:

```js
art: [
  {src: 'lore-art/paarthurnax.png', alt: 'Paarthurnax, the ancient dragon.', caption: 'Paarthurnax'},
  {src: 'lore-art/mountain.png', alt: 'The snowy mountain summit.', caption: 'The Throat of the World'}
]
```

Place new image files in this folder. Multiple chapter illustrations appear together, stacked in their listed order. The current two-image page places Alduin beneath Paarthurnax. An empty art array uses the decorative mountain drawing. Images retain their proportions. All supplied PNG files are preserved unchanged. Whiterun belongs to chapter 1, the dragons to chapter 2, Blackreach to chapter 3, and Skuldafn to chapter 4.

No build step is needed. Do not run the old build script over manually edited page files.
