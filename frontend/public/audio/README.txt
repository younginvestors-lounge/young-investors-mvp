Young Investors — Lounge music
==============================

Put your royalty-free track here so the Lounge player can find it:

    frontend/public/audio/lounge.mp3

REQUIREMENTS
- Format: MP3 (most browser-compatible). AAC/.m4a and .ogg also work as
  fallbacks if you add them as lounge.m4a / lounge.ogg.
- "Not supported" usually means the file is a format browsers can't play
  (e.g. .wma, .aiff, .flac) OR it's not inside this public/audio/ folder.
  Fix: convert it to MP3 and name it exactly  lounge.mp3
- Keep it royalty-free / licensed for use (e.g. a Tadow-style lo-fi/jazz loop).
- A looping track of ~1–3 minutes is plenty; the player loops it quietly.

The player (components/LoungeMusic.tsx) auto-detects the file. If the file is
missing or unplayable, the control shows "Music soon" instead of erroring.

This folder is served at the URL path  /audio/  (e.g. /audio/lounge.mp3).
MOCK_MVP_PAPER_TRADING_ONLY — ambience only.
