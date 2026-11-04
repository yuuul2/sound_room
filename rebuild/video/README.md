# Uploaded splash video
Source: user-uploaded video_star.mp4, 720×1280, H.264, 24fps, 10 seconds, originally AAC audio.
video_star.original.mp4 is the untouched uploaded file.
splash-star.mp4 copies the original video stream without re-encoding, removes audio, and enables fast-start playback.
splash-star-poster.jpg is its first frame for loading/error/reduced-motion fallback.
The encoded video pixels are unchanged. A theme-specific display overlay matches the onboarding palette; no deformation shader or generated animation is applied.
The screen uses centered cover sizing; narrow phones crop the horizontal edges to fill the existing screen.

## Ping-pong playback (2026-11-05)
The app now plays splash-star-pingpong.mp4: original frames 0…239 followed by 238…1, then loops back to frame 0. Endpoints are not duplicated. 478 frames at 24fps (19.9167 seconds), H.264 CRF 18, muted, fast-start. The original upload and previous forward-only version remain preserved. Display tone overlays are unchanged.
