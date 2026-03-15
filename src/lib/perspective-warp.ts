/**
 * Perspective Warp utility using Canvas 2D triangulation.
 * Renders an image warped to fit 4 arbitrary corner points by subdividing
 * into a grid of triangles and applying affine transforms per triangle.
 */

export interface Point {
  x: number;
  y: number;
}

export type Corners = [Point, Point, Point, Point]; // TL, TR, BR, BL

/**
 * Bilinear interpolation for a point (u, v) in [0,1]x[0,1]
 * mapped to the quadrilateral defined by corners [TL, TR, BR, BL].
 */
function bilinear(corners: Corners, u: number, v: number): Point {
  const [tl, tr, br, bl] = corners;
  return {
    x: (1 - u) * (1 - v) * tl.x + u * (1 - v) * tr.x + u * v * br.x + (1 - u) * v * bl.x,
    y: (1 - u) * (1 - v) * tl.y + u * (1 - v) * tr.y + u * v * br.y + (1 - u) * v * bl.y,
  };
}

/**
 * Draw an image warped into the quadrilateral defined by `corners`.
 * Uses triangulation with `subdivisions` steps for accuracy.
 */
export function drawPerspectiveWarp(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  corners: Corners,
  subdivisions: number = 12
) {
  const sw = img.width;
  const sh = img.height;
  const n = subdivisions;

  ctx.save();

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const u0 = i / n, u1 = (i + 1) / n;
      const v0 = j / n, v1 = (j + 1) / n;

      // Destination points
      const p00 = bilinear(corners, u0, v0);
      const p10 = bilinear(corners, u1, v0);
      const p01 = bilinear(corners, u0, v1);
      const p11 = bilinear(corners, u1, v1);

      // Source coordinates
      const sx0 = u0 * sw, sx1 = u1 * sw;
      const sy0 = v0 * sh, sy1 = v1 * sh;

      // Draw two triangles per quad cell
      drawTexturedTriangle(
        ctx, img,
        sx0, sy0, sx1, sy0, sx0, sy1,
        p00.x, p00.y, p10.x, p10.y, p01.x, p01.y
      );
      drawTexturedTriangle(
        ctx, img,
        sx1, sy0, sx1, sy1, sx0, sy1,
        p10.x, p10.y, p11.x, p11.y, p01.x, p01.y
      );
    }
  }

  ctx.restore();
}

/**
 * Draws a textured triangle using affine transform + clipping.
 */
function drawTexturedTriangle(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  // Source triangle
  sx0: number, sy0: number,
  sx1: number, sy1: number,
  sx2: number, sy2: number,
  // Destination triangle
  dx0: number, dy0: number,
  dx1: number, dy1: number,
  dx2: number, dy2: number
) {
  ctx.save();

  // Clip to destination triangle
  ctx.beginPath();
  ctx.moveTo(dx0, dy0);
  ctx.lineTo(dx1, dy1);
  ctx.lineTo(dx2, dy2);
  ctx.closePath();
  ctx.clip();

  // Compute affine transform from source to destination
  // We need to find the transform matrix that maps:
  // (sx0, sy0) -> (dx0, dy0)
  // (sx1, sy1) -> (dx1, dy1)
  // (sx2, sy2) -> (dx2, dy2)

  const denom = sx0 * (sy1 - sy2) + sx1 * (sy2 - sy0) + sx2 * (sy0 - sy1);
  if (Math.abs(denom) < 1e-10) {
    ctx.restore();
    return;
  }

  const m11 = (dx0 * (sy1 - sy2) + dx1 * (sy2 - sy0) + dx2 * (sy0 - sy1)) / denom;
  const m12 = (dx0 * (sx2 - sx1) + dx1 * (sx0 - sx2) + dx2 * (sx1 - sx0)) / denom;
  const m13 = (dx0 * (sx1 * sy2 - sx2 * sy1) + dx1 * (sx2 * sy0 - sx0 * sy2) + dx2 * (sx0 * sy1 - sx1 * sy0)) / denom;

  const m21 = (dy0 * (sy1 - sy2) + dy1 * (sy2 - sy0) + dy2 * (sy0 - sy1)) / denom;
  const m22 = (dy0 * (sx2 - sx1) + dy1 * (sx0 - sx2) + dy2 * (sx1 - sx0)) / denom;
  const m23 = (dy0 * (sx1 * sy2 - sx2 * sy1) + dy1 * (sx2 * sy0 - sx0 * sy2) + dy2 * (sx0 * sy1 - sx1 * sy0)) / denom;

  ctx.setTransform(m11, m21, m12, m22, m13, m23);

  // Draw the image — slightly oversized to avoid seams
  ctx.drawImage(img, 0, 0);

  ctx.restore();
}

/**
 * Get default corner positions for an overlay centered at (cx, cy) with given dimensions.
 */
export function getDefaultCorners(cx: number, cy: number, w: number, h: number): Corners {
  const hw = w / 2, hh = h / 2;
  return [
    { x: cx - hw, y: cy - hh }, // TL
    { x: cx + hw, y: cy - hh }, // TR
    { x: cx + hw, y: cy + hh }, // BR
    { x: cx - hw, y: cy + hh }, // BL
  ];
}

/**
 * Get the bounding box of 4 corners.
 */
export function cornersBounds(corners: Corners) {
  const xs = corners.map(p => p.x);
  const ys = corners.map(p => p.y);
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
}
