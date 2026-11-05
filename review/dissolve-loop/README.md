# Prebuffered bidirectional dissolve preview

Retains forward and reverse playback. Forward is the preserved silent user video; reverse is encoded with ffmpeg -vf reverse -an -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -movflags +faststart.

Two HTML video decoders load complete local blobs before playback. The hidden video is sought to 2 seconds and prepared while the other plays. At 8 seconds it starts at normal speed; a 1.4-second linear opacity dissolve completes before the outgoing 10-second file ends. Outgoing is then paused and reset while hidden. No native loop, playback-rate easing, optical-flow deformation, or image recoloring. Lower layer stays opaque to avoid a dark crossfade. Shared theme overlays and title styles copied unchanged from existing comparison. Main app remains untouched pending user review.

This addresses visible decoder loop resets and replaces the near-mirrored end-frame crossfade with offset moving segments. It does not guarantee a perceptually invisible motion reversal on every device; visual approval remains with the user.
