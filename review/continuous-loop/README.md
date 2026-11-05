# Continuous forward loop comparison
Requested after eased ping-pong playback felt like stopping.
forward.mp4: 9-second forward-only loop at original 24fps/speed. Original frames 24…215, then moving frames 216…239 blended with 0…23 using a smooth opacity curve. No speed ramp, reversed motion, or spatial warping.
previous.mp4: previously deployed eased ping-pong loop for comparison.
The user selected continuous forward playback on 2026-11-05. The app now uses the same forward video; this page retains the previous loop for comparison.
Source builder: rebuild/video/render-flow-loop.py.

2026-11-05: Added archived constant-speed ping-pong clip as pingpong.mp4 for user-requested comparison. Default preview is forward → reverse (478 frames, 24fps); ?clip=forward selects current app playback. The eased previous variant remains selectable. Production app playback is unchanged.
