# Uploaded splash video
Source: user-uploaded video_star.mp4, 720×1280, H.264, 24fps, 10 seconds, originally AAC audio.
video_star.original.mp4 is the untouched uploaded file.
splash-star.mp4 copies the original video stream without re-encoding, removes audio, and enables fast-start playback.
splash-star-poster.jpg is its first frame for loading/error/reduced-motion fallback.
The encoded video pixels are unchanged. A theme-specific display overlay matches the onboarding palette; no deformation shader or generated animation is applied.
The screen uses centered cover sizing; narrow phones crop the horizontal edges to fill the existing screen.

## Ping-pong playback (2026-11-05)
The app now plays splash-star-pingpong.mp4: original frames 0…239 followed by 238…1, then loops back to frame 0. Endpoints are not duplicated. 478 frames at 24fps (19.9167 seconds), H.264 CRF 18, muted, fast-start. The original upload and previous forward-only version remain preserved. Display tone overlays are unchanged.

## Eased direction changes (2026-11-05)
The app now uses splash-star-smooth-loop.mp4, built by render-smooth-loop.py from the preserved forward-only source. Motion accelerates/decelerates over 1.2 seconds at each end and retains the original speed in the middle. Temporal frame blending (no optical-flow or spatial distortion) produces 60fps playback: 1339 frames / 22.316667 seconds. H.264 constant QP 18 and a final keyframe keep the loop boundary consistent. The original and previous loop remain archived.
