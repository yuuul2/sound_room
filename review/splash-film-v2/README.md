# Splash video review v2

Review-only, no app code changes. Two 12-second, 720×1440, 24fps H.264 MP4s:
- lights: asynchronous star pulses, subtle moon breath, small reflection flecks.
- motion: same light effects plus rigid cloud translations, masked water-plane translation and rigid boat rocking/bobbing. No mesh warping or camera motion.

The original light PNG is rendered at the app's existing 0.86 saturation. The image tool made a boat-removal clean plate; only a feathered ellipse behind the original boat is composited from it. The original boat outline is clipped from the original image in the video compositor. Cloud and water layers have feathered edges. This is a 2D composite, not simulated 3D water or AI-generated video. Small overlapping textures at layer boundaries may still need review at phone size. All original assets remain unchanged.

Reproduce with: node review/splash-film-v2/render.cjs
Requires project Playwright, Chromium at /usr/bin/chromium, and ffmpeg.
