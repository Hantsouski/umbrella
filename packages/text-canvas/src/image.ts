import type { NumOrString, UIntArray } from "@thi.ng/api";
import { blit1d } from "@thi.ng/arrays/blit";
import { peek } from "@thi.ng/arrays/peek";
import { isNumber } from "@thi.ng/checks/is-number";
import { clamp0 } from "@thi.ng/math/interval";
import { FMT_ANSI565 } from "@thi.ng/text-format/ansi";
import { SHADES_BLOCK, type ClipRect, type ImageOpts } from "./api.js";
import { Canvas, canvas } from "./canvas.js";
import { formatCanvas } from "./format.js";
import { charCode, intersectRect } from "./utils.js";

export const blit = (dest: Canvas, x: number, y: number, src: Canvas) => {
	x |= 0;
	y |= 0;
	const { data: sbuf, width: sw, height: sh } = src;
	const { data: dbuf, width: dw } = dest;
	const {
		x1,
		y1,
		y2,
		w: iw,
		h: ih,
	} = intersectRect(
		{ x1: x, y1: y, x2: x + sw, y2: y + sh, w: sw, h: sh },
		peek(dest.clipRects)
	);
	if (!iw || !ih) return;
	const sx = clamp0(x1 - x);
	const sy = clamp0(y1 - y);
	for (let yy = sy, dy = y1; dy < y2; yy++, dy++) {
		let sidx = sx + yy * sw;
		let didx = x1 + dy * dw;
		dbuf.set(sbuf.subarray(sidx, sidx + iw), didx);
	}
};

/**
 * Similar to {@link blit}. Pastes `src` {@link Canvas} into `dest` at given
 * position and uses `mask` to exclude pixels from being copied (and therefore
 * achieve a form of 1bit transparency, similar to GIFs), i.e. only non-`mask`
 * pixels/chars will be copied. Supports region clipping.
 *
 * @example
 * ```ts
 * // source canvas
 * const a = canvasFromText([
 *   "###==###",
 *   "##====##",
 *   "#======#",
 *   "##====##",
 *   "###==###",
 * ]);
 *
 * // destination canvas (filled w/ "-")
 * const b = canvas(12,7);
 * clear(b, true, "-");
 *
 * // paste `a` several times into `b` using "#" as mask
 * blitMask(b, -4, -2, a, "#"); // top-left (partially outside)
 * blitMask(b, 2, 1, a, "#");   // center
 * blitMask(b, 8, 4, a, "#");   // bottom-right (part outside)
 *
 * // show result
 * console.log(formatCanvas(b))
 * // ===---------
 * // ==---==-----
 * // =---====----
 * // ---======---
 * // ----====---=
 * // -----==---==
 * // ---------===
 * ```
 *
 * @param dest
 * @param x
 * @param y
 * @param src
 * @param mask
 */
export const blitMask = (
	dest: Canvas,
	x: number,
	y: number,
	src: Canvas,
	mask: NumOrString = 0x20
) => {
	x |= 0;
	y |= 0;
	const { data: sbuf, width: sw, height: sh } = src;
	const { data: dbuf, width: dw } = dest;
	const {
		x1,
		y1,
		y2,
		w: iw,
		h: ih,
	} = intersectRect(
		{ x1: x, y1: y, x2: x + sw, y2: y + sh, w: sw, h: sh },
		peek(dest.clipRects)
	);
	if (!iw || !ih) return;
	const sx = clamp0(x1 - x);
	const sy = clamp0(y1 - y);
	mask = charCode(mask, 0);
	for (let yy = sy, dy = y1; dy < y2; yy++, dy++) {
		let sidx = sx + yy * sw;
		let didx = x1 + dy * dw;
		blit1d(dbuf, didx, sbuf.subarray(sidx, sidx + iw), mask);
	}
};

export const resize = (canvas: Canvas, newWidth: number, newHeight: number) => {
	if (canvas.width === newWidth && canvas.height === newHeight) return;
	const dest = new Canvas(newWidth, newHeight);
	dest.data.fill(charCode(0x20, canvas.format));
	blit(dest, 0, 0, canvas);
	canvas.data = dest.data;
	canvas.size[0] = newWidth;
	canvas.size[1] = newHeight;
	canvas.clipRects = [
		{
			x1: 0,
			y1: 0,
			x2: newWidth,
			y2: newHeight,
			w: newWidth,
			h: newHeight,
		},
	];
};

export const extract = (
	canvas: Canvas,
	x: number,
	y: number,
	w: number,
	h: number
) => {
	const dest = new Canvas(w, h, canvas.format, peek(canvas.styles));
	blit(dest, -x, -y, canvas);
	return dest;
};

/**
 * Scrolls canvas vertically by `dy` lines. If `dy > 0` content moves
 * upward, if `dy < 0` downward. The new empty space will be filled with
 * `clear` char (default: ` `).
 *
 * @param canvas -
 * @param dy -
 * @param clear -
 */
export const scrollV = (canvas: Canvas, dy: number, clear = 0x20) => {
	const { data, width } = canvas;
	const ch = charCode(clear, canvas.format);
	dy *= width;
	if (dy < 0) {
		data.copyWithin(-dy, 0, dy);
		data.fill(ch, 0, -dy);
	} else if (dy > 0) {
		data.copyWithin(0, dy);
		data.fill(ch, -dy);
	}
};

/**
 *
 * @param canvas -
 * @param x -
 * @param y -
 * @param w -
 * @param h -
 * @param pixels -
 * @param opts -
 */
export const image = (
	canvas: Canvas,
	x: number,
	y: number,
	w: number,
	h: number,
	pixels: ArrayLike<number>,
	opts?: Partial<ImageOpts>
) => {
	x |= 0;
	y |= 0;
	w |= 0;
	h |= 0;
	const { data, width } = canvas;
	const {
		x1,
		y1,
		x2,
		y2,
		sx,
		sy,
		w: iw,
		h: ih,
	} = imgRect(canvas, x, y, w, h);
	if (!iw || !ih) return;
	const { chars, format, gamma, invert, bits } = {
		chars: SHADES_BLOCK,
		format: canvas.format,
		gamma: 1,
		invert: false,
		bits: 8,
		...opts,
	};
	const fmt = isNumber(format) ? () => format : format;
	const max = (1 << bits) - 1;
	const mask = invert ? max : 0;
	const norm = 1 / max;
	const num = chars.length - 1;
	for (let yy = sy, dy = y1; dy < y2; yy++, dy++) {
		let sidx = sx + yy * w;
		let didx = x1 + dy * width;
		for (let xx = sx, dx = x1; dx < x2; xx++, dx++) {
			const col = Math.pow((pixels[sidx++] ^ mask) * norm, gamma);
			data[didx++] = charCode(chars[(col * num + 0.5) | 0], fmt(col));
		}
	}
};

/**
 * Optimized version of {@link image}, which only uses a single char for all
 * pixels and applies pixel values directly as formatting data (for each pixel).
 *
 * @param canvas -
 * @param x -
 * @param y -
 * @param w -
 * @param h -
 * @param pixels -
 * @param char -
 */
export const imageRaw = (
	canvas: Canvas,
	x: number,
	y: number,
	w: number,
	h: number,
	pixels: ArrayLike<number>,
	char = "█"
) => {
	x |= 0;
	y |= 0;
	w |= 0;
	h |= 0;
	const { data, width } = canvas;
	const {
		x1,
		y1,
		x2,
		y2,
		sx,
		sy,
		w: iw,
		h: ih,
	} = imgRect(canvas, x, y, w, h);
	if (!iw || !ih) return;
	const code = char.charCodeAt(0);
	for (let yy = sy, dy = y1; dy < y2; yy++, dy++) {
		let sidx = sx + yy * w;
		let didx = x1 + dy * width;
		for (let xx = sx, dx = x1; dx < x2; xx++, dx++) {
			data[didx++] = code | ((pixels[sidx++] & 0xffff) << 16);
		}
	}
};

/**
 * Similar to {@link imageRaw}, but **only** directly modifies the format bits
 * of the specified region (any character data remains intact).
 *
 * @param canvas
 * @param x
 * @param y
 * @param w
 * @param h
 * @param pixels
 */
export const imageRawFmtOnly = (
	canvas: Canvas,
	x: number,
	y: number,
	w: number,
	h: number,
	pixels: ArrayLike<number>
) => {
	x |= 0;
	y |= 0;
	w |= 0;
	h |= 0;
	const { data, width } = canvas;
	const {
		x1,
		y1,
		x2,
		y2,
		sx,
		sy,
		w: iw,
		h: ih,
	} = imgRect(canvas, x, y, w, h);
	if (!iw || !ih) return;
	for (let yy = sy, dy = y1; dy < y2; yy++, dy++) {
		let sidx = sx + yy * w;
		let didx = x1 + dy * width;
		for (let xx = sx, dx = x1; dx < x2; xx++, dx++) {
			data[didx] =
				(data[didx] & 0xffff) | ((pixels[sidx++] & 0xffff) << 16);
			didx++;
		}
	}
};

/**
 * Similar to {@link imageRaw}, but always thresholds pixels given `thresh` and
 * converts groups of 2x4 pixels into Unicode Braille characters. Each written
 * char will use given `format` ID (optional) or default to canvas' currently
 * active format.
 *
 * @remarks
 * For best results, it's recommended to pre-dither the image (e.g. using
 * thi.ng/pixel-dither or other dither tools).
 *
 * Reference:
 * https://en.wikipedia.org/wiki/Braille_Patterns#Identifying.2C_naming_and_ordering
 *
 * @param canvas -
 * @param x -
 * @param y -
 * @param w -
 * @param h -
 * @param pixels -
 * @param thresh -
 * @param format -
 */
export const imageBraille = (
	canvas: Canvas,
	x: number,
	y: number,
	w: number,
	h: number,
	pixels: ArrayLike<number>,
	thresh: number,
	format?: number
) => {
	x |= 0;
	y |= 0;
	w |= 0;
	h |= 0;
	const { data, width } = canvas;
	const fmt = (format !== undefined ? format : canvas.format) << 16;
	const {
		x1,
		y1,
		x2,
		y2,
		sx,
		sy,
		w: iw,
		h: ih,
	} = imgRect(canvas, x, y, w >> 1, h >> 2);
	if (!iw || !ih) return;
	const w2 = w * 2;
	const w3 = w * 3;

	const braille = (i: number) =>
		(pixels[i] >= thresh ? 1 : 0) |
		(pixels[i + w] >= thresh ? 2 : 0) |
		(pixels[i + w2] >= thresh ? 4 : 0) |
		(pixels[i + w3] >= thresh ? 8 : 0) |
		(pixels[i + 1] >= thresh ? 16 : 0) |
		(pixels[i + w + 1] >= thresh ? 32 : 0) |
		(pixels[i + w2 + 1] >= thresh ? 64 : 0) |
		(pixels[i + w3 + 1] >= thresh ? 128 : 0) |
		0x2800;

	for (let yy = sy, dy = y1; dy < y2; yy += 4, dy++) {
		let sidx = sx + yy * w;
		let didx = x1 + dy * width;
		for (let xx = sx, dx = x1; dx < x2; xx += 2, dx++, sidx += 2) {
			data[didx++] = braille(sidx) | fmt;
		}
	}
};

/**
 * Syntax sugar for {@link imageBraille}. Takes a thi.ng/pixel compatible 8bit
 * grayscale pixel buffer and converts it into a new {@link canvas}.
 *
 * @remarks
 * The returned canvas will have 50% width and 25% height of the original image
 * (due to each Braille character encoding 2x4 pixels).
 *
 * @param src -
 * @param thresh -
 * @param format -
 */
export const imageCanvasBraille = (
	src: { width: number; height: number; data: UIntArray },
	thresh: number,
	format = 0
) => {
	const dest = canvas(src.width >> 1, src.height >> 2);
	imageBraille(dest, 0, 0, src.width, src.height, src.data, thresh, format);
	return dest;
};

/**
 * Same as {@link imageCanvasBraille}, but returns resulting canvas as plain
 * string (of Unicode Braille characters).
 *
 * @param src -
 * @param thresh -
 */
export const imageStringBraille = (
	src: { width: number; height: number; data: UIntArray },
	thresh: number
) => formatCanvas(imageCanvasBraille(src, thresh, 0));

/**
 * Syntax sugar for {@link imageRaw}. Takes a thi.ng/pixel compatible 16bit
 * pixel buffer in RGB565 format and converts it into a new {@link canvas}. The
 * optional `char` will be used as character for each pixel.
 *
 * @param src -
 * @param char -
 */
export const imageCanvas565 = (
	src: { width: number; height: number; data: UIntArray },
	char?: string
) => {
	const dest = canvas(src.width, src.height);
	imageRaw(dest, 0, 0, src.width, src.height, src.data, char);
	return dest;
};

/**
 * Same as {@link imageCanvas565}, but returns resulting canvas as 24bit ANSI
 * string.
 *
 * @param src -
 * @param char -
 */
export const imageString565 = (
	src: { width: number; height: number; data: UIntArray },
	char?: string,
	fmt = FMT_ANSI565
) => formatCanvas(imageCanvas565(src, char), fmt);

const imgRect = (
	canvas: Canvas,
	x: number,
	y: number,
	w: number,
	h: number
) => {
	const rect: ClipRect & { sx: number; sy: number } = <any>(
		intersectRect(
			{ x1: x, y1: y, x2: x + w, y2: y + h, w, h },
			peek(canvas.clipRects)
		)
	);
	rect.sx = clamp0(rect.x1 - x);
	rect.sy = clamp0(rect.y1 - y);
	return rect;
};
