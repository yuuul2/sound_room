"""Build a deterministic eased palindrome using temporal blends, no spatial warping."""
import json
import math
import subprocess
import tempfile
from pathlib import Path
import numpy as np

root = Path(__file__).resolve().parent
source = root / "splash-star.mp4"
info = json.loads(subprocess.check_output([
    "ffprobe", "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height,nb_frames,r_frame_rate", "-of", "json", str(source)
]))["streams"][0]
width, height, count = info["width"], info["height"], int(info["nb_frames"])
num, den = map(int, info["r_frame_rate"].split("/"))
source_fps = num / den
fps, ramp = 60, 1.2
distance = (count - 1) / source_fps
half_duration = distance + ramp
duration = half_duration * 2
frames = round(duration * fps)

def source_position(t):
    u = t if t <= half_duration else duration - t
    if u < ramp:
        seconds = u*u/(2*ramp)
    elif u > half_duration-ramp:
        seconds = distance-(half_duration-u)**2/(2*ramp)
    else:
        seconds = u-ramp/2
    return max(0, min(count-1, seconds*source_fps))

with tempfile.TemporaryDirectory(prefix="sound-room-eased-") as temp:
    decoded = Path(temp)/"frames.rgb"
    subprocess.run(["ffmpeg","-v","error","-y","-i",str(source),"-an",
                    "-pix_fmt","rgb24","-f","rawvideo",str(decoded)], check=True)
    data = np.memmap(decoded, dtype=np.uint8, mode="r", shape=(count,height,width,3))
    encoder = subprocess.Popen([
        "ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","rgb24",
        "-video_size",f"{width}x{height}","-framerate",str(fps),"-i","pipe:0",
        "-an","-c:v","libx264","-preset","medium","-qp","18","-x264-params","ipratio=1:pbratio=1","-pix_fmt","yuv420p",
        "-force_key_frames", f"expr:gte(n,{frames-1})",
        "-movflags","+faststart",str(root/"splash-star-smooth-loop.mp4")
    ], stdin=subprocess.PIPE)
    try:
        for n in range(frames):
            position = source_position(n/fps)
            a = math.floor(position)
            b = min(a+1,count-1)
            weight = round((position-a)*256)
            if weight == 0 or a == b:
                frame = data[a]
            else:
                frame = ((data[a].astype(np.uint16)*(256-weight) + data[b].astype(np.uint16)*weight + 128) >> 8).astype(np.uint8)
            encoder.stdin.write(frame.tobytes())
            if n % 300 == 0:
                print(f"Rendered {n}/{frames}", flush=True)
    finally:
        encoder.stdin.close()
    if encoder.wait() != 0:
        raise RuntimeError("Video encoding failed")
    del data
assert abs(source_position(0)-source_position(duration)) < 1e-8
assert abs(source_position(half_duration)-(count-1)) < 1e-8
print(f"Rendered {frames} frames, {duration:.6f}s, {ramp}s speed ramps.")
