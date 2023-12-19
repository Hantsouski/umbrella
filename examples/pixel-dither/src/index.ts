import type { IObjectOf } from "@thi.ng/api";
import { pixelCanvas2d } from "@thi.ng/canvas";
import {
	GRAY8,
	IntBuffer,
	imageFromURL,
	intBufferFromImage,
} from "@thi.ng/pixel";
import {
	ATKINSON,
	BURKES,
	DIFFUSION_2D,
	DIFFUSION_COLUMN,
	DIFFUSION_ROW,
	FLOYD_STEINBERG,
	JARVIS_JUDICE_NINKE,
	SIERRA2,
	STUCKI,
	THRESHOLD,
	ditherWith,
	type DitherKernel,
} from "@thi.ng/pixel-dither";
import IMG from "./michelangelo.png";

const img = await imageFromURL(IMG);

const root = document.getElementById("app")!;
root.appendChild(img);

const processImage = (buf: IntBuffer, id: string, kernel: DitherKernel) => {
	const { canvas, ctx } = pixelCanvas2d(buf.width, buf.height, root);
	ditherWith(kernel, buf.copy()).blitCanvas(canvas);
	ctx.fillStyle = "white";
	ctx.fillRect(0, buf.height - 12, ctx.measureText(id).width + 8, 12);
	ctx.fillStyle = "red";
	ctx.fillText(id, 4, buf.height - 2);
};

const buf = intBufferFromImage(img, GRAY8);

Object.entries(<IObjectOf<DitherKernel>>{
	ATKINSON: ATKINSON,
	BURKES: BURKES,
	DIFFUSION_ROW: DIFFUSION_ROW,
	DIFFUSION_COLUMN: DIFFUSION_COLUMN,
	DIFFUSION_2D: DIFFUSION_2D,
	FLOYD_STEINBERG: FLOYD_STEINBERG,
	JARVIS_JUDICE_NINKE: JARVIS_JUDICE_NINKE,
	SIERRA2: SIERRA2,
	STUCKI: STUCKI,
	THRESHOLD: THRESHOLD,
	CUSTOM: {
		ox: [1],
		oy: [1],
		weights: [1],
		shift: 1,
	},
}).forEach(([id, k]) => processImage(buf, id, k));
