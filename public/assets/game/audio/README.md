# Pack audio - première écoute

Ce dossier contient des maquettes audio originales générées localement pour le jeu. Elles ne sont pas encore chargées par Phaser afin de permettre une validation séparée.

## Organisation

- `music/`: 10 thèmes et transitions musicales.
- `ambience/`: 9 boucles de lieux.
- `sfx/`: 18 effets courts.

Le mapping recommandé par scène se trouve dans `data/audio-assets-manifest.yaml`.

## Écoute

Lancer le projet:

```bash
npm run dev
```

Puis ouvrir:

```text
http://127.0.0.1:5173/audio-preview.html
```

La page arrête automatiquement la piste précédente lorsqu'une nouvelle piste est lancée.

## Notes

- Format: OGG Vorbis stéréo, 22050 Hz.
- Taille totale: environ 2,7 Mo.
- Les volumes sont volontairement normalisés; le mix final sera réglé dans Phaser.
- Le script `tools/generate_audio_assets.py` permet de régénérer le pack.
