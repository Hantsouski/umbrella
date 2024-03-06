import type { Fn, IObjectOf } from "@thi.ng/api";
import { DEFAULT, defmulti } from "@thi.ng/defmulti/defmulti";
import { LogLevel } from "@thi.ng/logger/api";
import { deg, rad } from "@thi.ng/math/angle";
import { clamp } from "@thi.ng/math/interval";
import { mix } from "@thi.ng/math/mix";
import { fract, mod } from "@thi.ng/math/prec";
import type {
	FnCall,
	Lit,
	Op1,
	Op2,
	Operator,
	Swizzle,
	Swizzle4_1,
	Term,
} from "@thi.ng/shader-ast";
import {
	isFloat,
	isInt,
	isLitNumericConst,
	isLitVecConst,
	isUint,
} from "@thi.ng/shader-ast/ast/checks";
import { FLOAT0, float, int, lit, uint } from "@thi.ng/shader-ast/ast/lit";
import { allChildren, walk } from "@thi.ng/shader-ast/ast/scope";
import { LOGGER } from "@thi.ng/shader-ast/logger";

/**
 * Replaces contents of `node` with those of `next`. All other existing props in
 * `node` will be removed.
 *
 * @param node -
 * @param next -
 *
 * @internal
 */
const replaceNode = (node: any, next: any) => {
	if (LOGGER.level <= LogLevel.DEBUG) {
		LOGGER.debug(`replacing AST node:`);
		LOGGER.debug("\told: " + JSON.stringify(node));
		LOGGER.debug("\tnew: " + JSON.stringify(next));
	}
	for (let k in node) {
		!next.hasOwnProperty(k) && delete node[k];
	}
	Object.assign(node, next);
	return true;
};

const replaceNumericNode = (node: any, res: number) => {
	node.type === "int" && (res |= 0);
	node.type === "uint" && (res >>>= 0);
	return replaceNode(node, lit(node.type, res));
};

/** @internal */
const maybeFoldMath = (op: Operator, l: number, r: number) =>
	op === "+"
		? l + r
		: op === "-"
		? l - r
		: op === "*"
		? l * r
		: op === "/"
		? l / r
		: undefined;

/** @internal */
const COMPS: Record<Swizzle4_1, number> = { x: 0, y: 1, z: 2, w: 3 };

const BUILTINS: IObjectOf<Fn<number[], number>> = {
	abs: ([a]) => Math.abs(a),
	acos: ([a]) => Math.acos(a),
	asin: ([a]) => Math.asin(a),
	ceil: ([a]) => Math.ceil(a),
	clamp: ([a, b, c]) => clamp(a, b, c),
	cos: ([a]) => Math.cos(a),
	degrees: ([a]) => deg(a),
	exp: ([a]) => Math.exp(a),
	exp2: ([a]) => Math.pow(2, a),
	floor: ([a]) => Math.floor(a),
	fract: ([a]) => fract(a),
	inversesqrt: ([a]) => 1 / Math.sqrt(a),
	log: ([a]) => Math.log(a),
	log2: ([a]) => Math.log2(a),
	max: ([a, b]) => Math.max(a, b),
	min: ([a, b]) => Math.min(a, b),
	mix: ([a, b, c]) => mix(a, b, c),
	mod: ([a, b]) => mod(a, b),
	pow: ([a, b]) => Math.pow(a, b),
	radians: ([a]) => rad(a),
	sign: ([a]) => Math.sign(a),
	sin: ([a]) => Math.sin(a),
	tan: ([a]) => Math.tan(a),
	sqrt: ([a]) => Math.sqrt(a),
};

/** @internal */
export const foldNode = defmulti<Term<any>, boolean | undefined>(
	(t) => t.tag,
	{},
	{
		[DEFAULT]: () => false,

		op1: (node) => {
			const $node = <Op1<any>>node;
			if ($node.op == "-" && isLitNumericConst($node.val)) {
				(<Lit<"float">>$node.val).val *= -1;
				return replaceNode(node, <Lit<"float">>$node.val);
			}
		},

		op2: (node) => {
			const $node = <Op2<any>>node;
			const op = $node.op;
			const l = <Lit<"float" | "int" | "uint">>$node.l;
			const r = <Lit<"float" | "int" | "uint">>$node.r;
			const isNumL = isLitNumericConst(l);
			const isNumR = isLitNumericConst(r);
			if (isNumL && isNumR) {
				let res = maybeFoldMath(op, l.val, r.val);
				if (res !== undefined) return replaceNumericNode(node, res);
			} else if (op === "*") {
				if ((isNumL && l.val === 0) || (isNumR && r.val === 0))
					return replaceNode(node, FLOAT0);
				if (isNumL && l.val === 1) return replaceNode(node, r);
				if (isNumR && r.val === 1) return replaceNode(node, l);
			} else if (op === "/") {
				if (isNumR && r.val === 1) return replaceNode(node, l);
			} else if (op === "+" || op === "-") {
				if (isNumL && l.val === 0) return replaceNode(node, r);
				if (isNumR && r.val === 0) return replaceNode(node, l);
			}
		},

		call_i: (node) => {
			const $node = <FnCall<any>>node;
			if ($node.args.every((x) => isLitNumericConst(x))) {
				const op = BUILTINS[$node.id];
				if (op !== undefined) {
					return replaceNumericNode(
						node,
						op($node.args.map((x) => (<Lit<any>>x).val))
					);
				}
			}
		},

		lit: (node) => {
			const $node = <Lit<any>>node;
			if (isLitNumericConst($node.val)) {
				if (isFloat($node.val)) {
					return replaceNode(node, float($node.val.val));
				}
				if (isInt($node.val)) {
					return replaceNode(node, int($node.val.val));
				}
				if (isUint($node.val)) {
					return replaceNode(node, uint($node.val.val));
				}
			}
		},

		swizzle: (node) => {
			const $node = <Swizzle<any>>node;
			const val = $node.val;
			if (isLitVecConst(val)) {
				if (isFloat(node)) {
					return replaceNode(
						node,
						float(val.val[COMPS[<Swizzle4_1>$node.id]])
					);
				}
			}
		},
	}
);

/**
 * Traverses given AST (potentially several times) and applies constant folding
 * optimizations where possible. Returns possibly updated tree (mutates
 * original).
 *
 * @remarks
 * Currently, only the following operations are supported / considered:
 *
 * - scalar math operators
 * - scalar math built-in functions
 * - single component vector swizzling
 * - literal hoisting
 *
 * @example
 * ```ts
 * import {
 *   add, defn, float, mul, neg, ret, scope, vec2, $x, $y
 * } from "@thi.ng/shader-ast";
 * import { targetGLSL } from "@thi.ng/shader-ast-glsl";
 * import { constantFolding } from "@thi.ng/shader-ast-optimize";
 *
 * // function def
 * const foo = defn("float", "foo", ["float"], (x) => [
 *   ret(mul(x, add(neg(float(10)), 42)))
 * ]);
 *
 * const bar = vec2(100, 200);
 *
 * // program def
 * const prog = scope([
 *   foo,
 *   foo(add(float(1), float(2))),
 *   foo(add($x(bar), $y(bar)))
 * ], true);
 *
 * // GLSL codegen
 * const glsl = targetGLSL();
 *
 * // unoptimized AST as GLSL (see section above)
 * console.log(glsl(prog));
 * // #version 300 es
 * // float foo(in float _s0) {
 * // return (_s0 * ((-10.0) + 42.0));
 * // }
 * // foo((1.0 + 2.0));
 * // foo((vec2(100.0, 200.0).x + vec2(100.0, 200.0).y));
 *
 * // with constant folding
 * console.log(glsl(constantFolding(prog)))
 * // #version 300 es
 * // float foo(in float _s0) {
 * // return (_s0 * 32.0);
 * // }
 * // foo(3.0);
 * // foo(300.0);
 *
 * const expr = mul(float(4), $x(vec2(2)))
 *
 * console.log(glsl(expr))
 * // (4.0 * vec2(2.0).x)
 *
 * // optimize single expression
 * console.log(glsl(constantFolding(expr)))
 * // 8.0
 * ```
 *
 * @param tree -
 */
export const constantFolding = (tree: Term<any>) => {
	let exec = true;
	while (exec) {
		exec = false;
		walk(
			(_, node) => {
				exec = foldNode(node) || exec;
			},
			allChildren,
			<any>null,
			tree,
			false
		);
	}
	return tree;
};
