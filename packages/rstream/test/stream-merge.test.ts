import { group } from "@thi.ng/testament";
import { frequencies, map, mapcat } from "@thi.ng/transducers";
import * as assert from "assert";
import {
	CloseMode,
	fromIterable,
	fromIterableSync,
	merge,
	State,
	StreamMerge,
} from "../src/index.js";
import { assertActive, assertUnsub } from "./utils.js";

let src: StreamMerge<number, number>;

const check = (expected: any, done: Function) => {
	let buf: any[] = [];
	return {
		next(x: any) {
			buf.push(x);
		},
		done() {
			assert.deepStrictEqual(
				buf.sort((a, b) => a - b),
				expected
			);
			done();
		},
	};
};

group(
	"StreamMerge",
	{
		"merges all inputs": ({ done }) => {
			src.subscribe(check([1, 2, 10, 20, 30, 40, 100, 200, 300], done));
		},

		"merges dynamic inputs": ({ done }) => {
			src = merge();
			src.add(fromIterable([1, 2, 3, 4], { delay: 10 }));
			src.add(fromIterable([10, 20], { delay: 5 }));
			src.subscribe(check([1, 2, 3, 4, 10, 20], done));
		},

		"merges dynamic inputs (synchronous)": ({ done }) => {
			src = merge({ closeIn: CloseMode.NEVER });
			src.subscribe(check([1, 2, 3, 4, 10, 20], done));
			src.add(fromIterableSync([1, 2, 3, 4]));
			src.add(fromIterableSync([10, 20]));
			src.done();
		},

		"stops when no more subs": () => {
			assert.ok(src.getState() === State.IDLE);
			let sub1 = src.subscribe({});
			let sub2 = src.subscribe({});
			sub1.unsubscribe();
			assertActive(src);
			sub2.unsubscribe();
			assertUnsub(src);
		},

		"applies transducer": ({ done }) => {
			src = merge<number, number>({
				src: [fromIterable([1, 2]), fromIterable([10, 20])],
				xform: mapcat((x: number) => [x, x + 1]),
			});
			src.subscribe(check([1, 2, 2, 3, 10, 11, 20, 21], done));
		},

		"transducer streams": ({ done }) => {
			const sources = [
				fromIterable([1, 2, 3]),
				fromIterable([4, 5, 6]),
			].map((s) => s.transform(map((x) => fromIterable([x, x, x]))));
			const main = merge({ src: <any>sources });
			const histogram = frequencies();
			let acc: any = histogram[0]();
			main.subscribe({
				next(x) {
					acc = histogram[2](acc, x);
				},
				done() {
					assert.deepStrictEqual(
						acc,
						new Map([
							[1, 3],
							[2, 3],
							[3, 3],
							[4, 3],
							[5, 3],
							[6, 3],
						])
					);
					done();
				},
			});
		},
	},
	{
		beforeEach: () => {
			src = merge<number, number>({
				src: [
					fromIterable([1, 2]),
					fromIterable([10, 20, 30, 40]),
					fromIterable([100, 200, 300]),
				],
			});
		},
	}
);
