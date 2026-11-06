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

## Continuous forward playback selected (2026-11-05)
The user chose forward-only looping. The app now uses splash-star-flow-loop.mp4 (9 seconds, 24fps), matching the reviewed forward sample. Original speed is retained; tail/head clips overlap for one second without reversing or slowing. splash-star-flow-poster.jpg matches the new first frame. The upload and all earlier loop versions remain preserved.

## Dedicated light upload (2026-11-06)
User-supplied light_video_star_splash.mp4 is preserved byte-for-byte as light_video_star_splash.original.mp4. render-light-flow-loop.py applies only the already-selected constant-speed forward tail/head overlap (216 frames at 24fps); no brightness, saturation, or color grading. splash-light-flow-poster.jpg matches its first frame. Light playback has no display tone overlay. Dark movie, poster, and existing dark overlay are unchanged. Muted playback remains enabled.

## Dark mixing onboarding movie (2026-11-06)
The user's 464×832, 24fps, 5.208333-second upload is preserved as onboarding-dark-mix.original.mp4. onboarding-dark-mix.mp4 copies the H.264 video stream with faststart (no re-encoding, grading, retiming, or reversal); its first frame is onboarding-dark-mix-poster.jpg. Only the first dark onboarding background uses this movie, muted and looped. Light artwork and all foreground elements remain unchanged. Off-page/background playback pauses; reduced motion and load failures retain the poster. The previous still-background grading is not applied to the supplied movie.

## Dark rest onboarding movie (2026-11-06)
The user-uploaded dark_온보딩_두번째1.mp4 is preserved as onboarding-dark-rest.original.mp4 (448×880, 24fps, 5.208333 seconds). onboarding-dark-rest.mp4 copies the silent video stream with faststart; no re-encoding, color overlay, speed change, or reversal. Only the second dark onboarding uses it. The matching poster covers reduced motion and load failures. First onboarding movie, both splash movies, light artwork, and foreground UI are unchanged.
