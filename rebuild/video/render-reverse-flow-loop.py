"""Constant-speed forward/reverse clips with moving overlaps at both turns."""
import subprocess, tempfile
from pathlib import Path
import numpy as np
root=Path(__file__).resolve().parent
width,height,fps,count,overlap=720,1280,24,240,24
with tempfile.TemporaryDirectory(prefix="sound-room-reverse-flow-") as temp:
    raw=Path(temp)/"source.rgb"
    subprocess.run(["ffmpeg","-v","error","-y","-i",str(root/"splash-star.mp4"),"-an","-pix_fmt","rgb24","-f","rawvideo",str(raw)],check=True)
    data=np.memmap(raw,dtype=np.uint8,mode="r",shape=(count,height,width,3))
    encoder=subprocess.Popen(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","rgb24","-video_size",f"{width}x{height}","-framerate",str(fps),"-i","pipe:0","-an","-c:v","libx264","-preset","medium","-crf","17","-pix_fmt","yuv420p","-movflags","+faststart",str(root/"splash-star-reverse-flow-loop.mp4")],stdin=subprocess.PIPE)
    def blend(a, b, n):
        u=n/(overlap-1)
        weight=round((u*u*(3-2*u))*256)
        frame=((data[a].astype(np.uint16)*(256-weight)+data[b].astype(np.uint16)*weight+128)>>8).astype(np.uint8)
        encoder.stdin.write(frame.tobytes())
    # Both sources move one original frame per output frame, including overlaps.
    for n in range(overlap,count-overlap):
        encoder.stdin.write(data[n].tobytes())
    for n in range(overlap):
        blend(count-overlap+n, count-1-n, n)
    for n in range(count-overlap-1,overlap-1,-1):
        encoder.stdin.write(data[n].tobytes())
    for n in range(overlap):
        blend(overlap-1-n, n, n)
    encoder.stdin.close()
    assert encoder.wait()==0
    del data
print("432 frames / 18 seconds: original speed, 1-second moving overlap at both direction changes.")
