#!/usr/bin/env python3
"""Generate AstroLab PWA icons (192 & 512) as PNG using only stdlib.

Renders an astrolabe-style glyph with 2x supersampling for smooth edges,
then box-downsamples to the target sizes. No third-party deps.
"""
import math
import struct
import zlib

BG_INNER = (42, 39, 80)     # #2A2750
BG_OUTER = (30, 27, 58)     # #1E1B3A
LILAC = (155, 141, 229)     # #9B8DE5
GOLD = (216, 183, 124)      # #D8B77C
GOLD_LT = (232, 210, 166)   # #E8D2A6


def render(size):
    """Render to an RGBA buffer (size x size) with 2x supersample."""
    ss = 2
    W = size * ss
    buf = bytearray(W * W * 4)  # RGBA

    def blend(px, py, rgba, a=1.0):
        # px,py in buffer pixels
        if px < 0 or py < 0 or px >= W or py >= W:
            return
        i = (py * W + px) * 4
        r, g, b = rgba
        ba = a
        br, bg, bb, baf = buf[i], buf[i + 1], buf[i + 2], buf[i + 3] / 255.0
        oa = ba + baf * (1 - ba)
        if oa <= 0:
            return
        nr = (r * ba + br * baf * (1 - ba)) / oa
        ng = (g * ba + bg * baf * (1 - ba)) / oa
        nb = (b * ba + bb * baf * (1 - ba)) / oa
        buf[i] = int(nr)
        buf[i + 1] = int(ng)
        buf[i + 2] = int(nb)
        buf[i + 3] = int(oa * 255)

    # Background gradient + rounded square mask
    radius = 0.22 * W
    cx = cy = W / 2.0
    for y in range(W):
        for x in range(W):
            # rounded-rect mask
            nx = min(x, W - 1 - x)
            ny = min(y, W - 1 - y)
            inside = True
            if nx < radius and ny < radius:
                d = math.hypot(radius - nx, radius - ny)
                inside = d <= radius
            if not inside:
                continue
            # gradient by distance from center
            t = math.hypot(x - cx, y - cy) / (W * 0.72)
            t = min(1.0, max(0.0, t))
            r = BG_INNER[0] * (1 - t) + BG_OUTER[0] * t
            g = BG_INNER[1] * (1 - t) + BG_OUTER[1] * t
            b = BG_INNER[2] * (1 - t) + BG_OUTER[2] * t
            blend(x, y, (r, g, b), 1.0)

    c = W / 2.0

    def ring(radius_px, color, width, dashes=None, phase=0.0):
        # draw a circle outline with given width (in buffer px)
        for deg in range(0, 360 * ss):
            ang = math.radians(deg / ss)
            on = True
            if dashes:
                seg = (ang + phase) % (dashes[0] + dashes[1])
                on = seg < dashes[0]
            rr = radius_px
            for w in range(-width // 2, width // 2 + 1):
                px = c + (rr + w) * math.cos(ang)
                py = c + (rr + w) * math.sin(ang)
                if on:
                    blend(int(round(px)), int(round(py)), color, 1.0)

    def disk(radius_px, color):
        for y in range(W):
            for x in range(W):
                if math.hypot(x - c, y - c) <= radius_px:
                    blend(x, y, color, 1.0)

    def line(a, b, color, width):
        x0, y0 = a
        x1, y1 = b
        steps = int(math.hypot(x1 - x0, y1 - y0)) + 1
        for s in range(steps + 1):
            t = s / steps
            px = x0 + (x1 - x0) * t
            py = y0 + (y1 - y0) * t
            for w in range(-width // 2, width // 2 + 1):
                blend(int(round(px + w)), int(round(py)), color, 1.0)

    # Outer ring
    ring(c * 0.62, LILAC, max(2, int(W * 0.012)))
    # Inner dashed ring
    ring(c * 0.40, GOLD, max(1, int(W * 0.007)), dashes=(0.18, 0.12))
    # Cross lines
    lw = max(1, int(W * 0.008))
    line((c, c - c * 0.72), (c, c + c * 0.72), GOLD_LT, lw)
    line((c - c * 0.72, c), (c + c * 0.72, c), GOLD_LT, lw)
    line((c - c * 0.51, c - c * 0.51), (c + c * 0.51, c + c * 0.51), GOLD_LT, lw)
    line((c + c * 0.51, c - c * 0.51), (c - c * 0.51, c + c * 0.51), GOLD_LT, lw)
    # Center dot
    disk(c * 0.13, GOLD)
    # Cardinal dots
    for ang in [0, 90, 180, 270]:
        a = math.radians(ang)
        px = c + c * 0.62 * math.cos(a)
        py = c + c * 0.62 * math.sin(a)
        disk(c * 0.045, LILAC)

    # Downsample 2x -> size
    out = bytearray(size * size * 4)
    for oy in range(size):
        for ox in range(size):
            r = g = b = a = 0
            for sy in range(ss):
                for sx in range(ss):
                    bx = ox * ss + sx
                    by = oy * ss + sy
                    i = (by * W + bx) * 4
                    r += buf[i]
                    g += buf[i + 1]
                    b += buf[i + 2]
                    a += buf[i + 3]
            n = ss * ss
            oi = (oy * size + ox) * 4
            out[oi] = r // n
            out[oi + 1] = g // n
            out[oi + 2] = b // n
            out[oi + 3] = a // n
    return out, size


def write_png(path, rgba, size):
    def chunk(tag, data):
        c = zlib.crc32(tag + data) & 0xFFFFFFFF
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', c)

    raw = bytearray()
    for y in range(size):
        raw.append(0)  # filter: none
        raw.extend(rgba[y * size * 4:(y + 1) * size * 4])
    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    idat = zlib.compress(bytes(raw), 9)
    with open(path, 'wb') as f:
        f.write(sig)
        f.write(chunk(b'IHDR', ihdr))
        f.write(chunk(b'IDAT', idat))
        f.write(chunk(b'IEND', b''))


if __name__ == '__main__':
    import os
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'public')
    os.makedirs(out_dir, exist_ok=True)
    for s in (192, 512):
        rgba, sz = render(s)
        write_png(os.path.join(out_dir, f'icon-{s}.png'), rgba, sz)
        print(f'wrote icon-{s}.png')
