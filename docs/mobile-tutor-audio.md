# Blend tutor playback

Units 8–12 use prepared mono MP3 recordings played at 1x. Mimi's 90% speed, Kogi's 80% speed, leading silence trim and shorter measured pauses are baked into those files. Mobile browsers no longer time-stretch these recordings or seek repeatedly through their pauses.

`app/tutor-mobile-audio.json` maps speaker + original URL to the prepared asset. Regenerate with `FFMPEG_EXE=/path/to/ffmpeg python3 scripts/prepare-mobile-tutor-audio.py`; the script uses existing local recordings and makes no TTS requests. Original recordings remain available for regeneration.

Personalized blend greetings use the provider's speed setting and are registered for native 1x playback. The provider's minimum speed is 0.7. Non-blend units keep their existing playback settings. A single owner guards tutor playback so delayed play events cannot restart an interrupted recording. Student recordings retain their original playback behavior.

Validate with `node scripts/test-tutor-audio.mjs`, TypeScript and both hosting builds. Real-device listening remains necessary to confirm an individual phone's audio output.

Isolated blend clips use `scripts/prepare-blend-sounds.py` and `app/blend-sounds.json`. The first consonant-only synthesis was reported to drop/distort consonants. The revised synthesis appends a short unstressed `AH0` support vowel after the complete cluster (for example `K L AH0`, not `K AH0 L`), and keeps the target cluster IPA separately. This is a teaching cue with a release vowel, not a claim of a vowel-free phonetic recording. Versioned clip URLs invalidate the old sounds. Code and asset tests verify routing and synthesis input; a listener must judge the resulting articulation.
