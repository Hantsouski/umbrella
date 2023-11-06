import { IntersectionType } from "@thi.ng/geom-api";
import { group } from "@thi.ng/testament";
import * as assert from "assert";
import {
	intersectLinePolylineAll,
	intersectRayPolylineAll,
} from "../src/index.js";

const pts = [
	[0, 0],
	[100, 0],
	[100, 50],
	[0, 100],
];

group("polyline", {
	"ray (x)": () => {
		assert.deepStrictEqual(
			intersectRayPolylineAll([-50, 25], [1, 0], pts, false),
			{
				type: IntersectionType.INTERSECT,
				isec: [[100, 25]],
			}
		);
		assert.deepStrictEqual(
			intersectRayPolylineAll([-50, 25], [1, 0], pts, true),
			{
				type: IntersectionType.INTERSECT,
				isec: [
					[0, 25],
					[100, 25],
				],
			}
		);
	},

	"ray (y)": () => {
		assert.deepStrictEqual(
			intersectRayPolylineAll([50, -50], [0, 1], pts, false),
			{
				type: IntersectionType.INTERSECT,
				isec: [
					[50, 0],
					[50, 75],
				],
			}
		);
		assert.deepStrictEqual(
			intersectRayPolylineAll([50, -50], [0, 1], pts, true),
			{
				type: IntersectionType.INTERSECT,
				isec: [
					[50, 0],
					[50, 75],
				],
			}
		);
	},

	"line (x)": () => {
		assert.deepStrictEqual(
			intersectLinePolylineAll([-50, 25], [50, 25], pts, false),
			{
				type: IntersectionType.NONE,
			}
		);
		assert.deepStrictEqual(
			intersectLinePolylineAll([-50, 25], [110, 25], pts, false),
			{
				type: IntersectionType.INTERSECT,
				isec: [[100, 25]],
			}
		);
		assert.deepStrictEqual(
			intersectLinePolylineAll([-50, 25], [50, 25], pts, true),
			{
				type: IntersectionType.INTERSECT,
				isec: [[0, 25]],
			}
		);
		assert.deepStrictEqual(
			intersectLinePolylineAll([-50, 25], [110, 25], pts, true),
			{
				type: IntersectionType.INTERSECT,
				isec: [
					[0, 25],
					[100, 25],
				],
			}
		);
	},

	"line (y)": () => {
		assert.deepStrictEqual(
			intersectLinePolylineAll([50, -25], [50, -20], pts, false),
			{
				type: IntersectionType.NONE,
			}
		);
		assert.deepStrictEqual(
			intersectLinePolylineAll([50, -25], [50, 50], pts, false),
			{
				type: IntersectionType.INTERSECT,
				isec: [[50, 0]],
			}
		);
		assert.deepStrictEqual(
			intersectLinePolylineAll([50, -25], [50, 100], pts, false),
			{
				type: IntersectionType.INTERSECT,
				isec: [
					[50, 0],
					[50, 75],
				],
			}
		);
	},

	"ray minD/maxD": () => {
		const I = Infinity;
		assert.deepStrictEqual(
			intersectRayPolylineAll([50, 25], [1, 0], pts, true, -I, I),
			{
				type: IntersectionType.INTERSECT,
				isec: [
					[0, 25],
					[100, 25],
				],
			}
		);
		assert.deepStrictEqual(
			intersectRayPolylineAll([-50, 25], [1, 0], pts, true, 60),
			{
				type: IntersectionType.INTERSECT,
				isec: [[100, 25]],
			}
		);
		assert.deepStrictEqual(
			intersectRayPolylineAll([50, 25], [1, 0], pts, true, 0, 10),
			{
				type: IntersectionType.NONE,
			}
		);
	},
});
