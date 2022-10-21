import { SIZEOF, Type } from "@thi.ng/api/typedarray";
import type { Pow2 } from "@thi.ng/binary";
import { align } from "@thi.ng/binary/align";
import { ceilPow2 } from "@thi.ng/binary/pow";
import { compareByKey } from "@thi.ng/compare/keys";
import { compareNumDesc } from "@thi.ng/compare/numeric";
import { DEFAULT, defmulti } from "@thi.ng/defmulti/defmulti";
import { illegalArgs } from "@thi.ng/errors/illegal-arguments";
import {
	CodeGenOpts,
	Enum,
	ICodeGen,
	PKG_NAME,
	Struct,
	StructField,
	TopLevelType,
	TypeColl,
	WASM32,
} from "./api.js";
import { isNumeric, isWasmString } from "./codegen/utils.js";

const sizeOf = defmulti<
	TopLevelType | StructField,
	TypeColl,
	CodeGenOpts,
	number
>(
	(x) => x.type,
	{},
	{
		[DEFAULT]: (field: StructField, types: TypeColl, opts: CodeGenOpts) => {
			if (field.__size) return field.__size;
			if (field.pad != null) {
				field.pad < 1 && illegalArgs(`pad size must be > 0`);
				return (field.__size = field.pad);
			}
			let size = 0;
			if (field.tag === "ptr") {
				size = opts.target.usizeBytes;
			} else if (field.tag === "slice") {
				size = opts.target.usizeBytes * 2;
			} else {
				size = isNumeric(field.type)
					? SIZEOF[<Type>field.type]
					: isWasmString(field.type)
					? opts.target.usizeBytes *
					  (opts.stringType === "slice" ? 2 : 1)
					: sizeOf(types[field.type], types, opts);
				if (field.tag == "array" || field.tag === "vec") {
					size *= field.len!;
					if (field.sentinel !== undefined && field.tag === "array") {
						size += SIZEOF[<Type>field.type];
					}
				}
			}
			return (field.__size = align(size, <Pow2>field.__align));
		},

		enum: (type) => {
			if (type.__size) return type.__size;
			return (type.__size = SIZEOF[(<Enum>type).tag]);
		},

		struct: (type, types, opts) => {
			if (type.__size) return type.__size;
			const struct = <Struct>type;
			let size = 0;
			for (let f of struct.fields) {
				size = align(size, <Pow2>f.__align!);
				f.__offset = size;
				size += sizeOf(f, types, opts);
			}
			return (type.__size = align(size, <Pow2>type.__align!));
		},
	}
);

const alignOf = defmulti<
	TopLevelType | StructField,
	TypeColl,
	CodeGenOpts,
	number
>(
	(x) => x.type,
	{},
	{
		[DEFAULT]: (field: StructField, types: TypeColl, opts: CodeGenOpts) => {
			if (field.__align) return field.__align;
			if (field.type === "usize") {
				field.type = opts.target.usize;
			}
			if (field.pad) return (field.__align = 1);
			let align = isNumeric(field.type)
				? SIZEOF[<Type>field.type]
				: isWasmString(field.type)
				? opts.target.usizeBytes
				: alignOf(types[field.type], types, opts);
			if (field.tag === "vec") {
				align *= ceilPow2(field.len!);
			}
			field.__align = align;
			return align;
		},

		enum: (type) => {
			const e = <Enum>type;
			if (!e.tag) e.tag = "i32";
			return (e.__align = SIZEOF[(<Enum>e).tag]);
		},

		struct: (type, types, opts) => {
			const struct = <Struct>type;
			let maxAlign = 0;
			for (let f of struct.fields) {
				maxAlign = Math.max(maxAlign, alignOf(f, types, opts));
			}
			return (type.__align = maxAlign);
		},
	}
);

const prepareType = defmulti<TopLevelType, TypeColl, CodeGenOpts, void>(
	(x) => x.type,
	{},
	{
		[DEFAULT]: (x: TopLevelType, types: TypeColl, opts: CodeGenOpts) => {
			if (x.__align && x.__size) return;
			alignOf(x, types, opts);
			sizeOf(x, types, opts);
		},
		struct: (x, types, opts) => {
			if (x.__align && x.__size) return;
			const struct = <Struct>x;
			alignOf(struct, types, opts);
			if (struct.auto) {
				struct.fields.sort(
					compareByKey("__align", <any>compareNumDesc)
				);
			}
			for (let f of struct.fields) {
				if (types[f.type]) {
					prepareType(types[f.type], types, opts);
				}
			}
			sizeOf(struct, types, opts);
		},
	}
);

/**
 * Takes a type collection and analyzes each analyzed to compute individual
 * alignments and sizes.
 *
 * @remarks
 * This function is idempotent and called automatically by
 * {@link generateTypes}. Only exported for dev/debug purposes.
 *
 * @param types
 *
 * @internal
 */
export const prepareTypes = (types: TypeColl, opts: CodeGenOpts) => {
	for (let id in types) {
		prepareType(types[id], types, opts);
	}
};

/**
 * Code generator main entry point. Takes an object of {@link TopLevelType}
 * definitions, an actual code generator implementation for a single target
 * language and (optional) global codegen options. Returns generated source code
 * for all given types as a single string.
 *
 * @remarks
 * Before actual code generation the types are first analyzed to compute their
 * alignments and sizes. This is only ever done once (idempotent), even if
 * `generateTypes()` is called multiple times for different target langs.
 *
 * @param types
 * @param codegen
 * @param opts
 */
export const generateTypes = (
	types: TypeColl,
	codegen: ICodeGen,
	opts: Partial<CodeGenOpts> = {}
) => {
	const $opts = <CodeGenOpts>{
		header: true,
		lineWidth: 80,
		stringType: "slice",
		target: WASM32,
		uppercaseEnums: true,
		...opts,
	};
	prepareTypes(types, $opts);
	const res: string[] = [];
	if ($opts.header) {
		codegen.doc(
			`Generated by ${PKG_NAME} at ${new Date().toISOString()} - DO NOT EDIT!`,
			res,
			$opts,
			true
		);
		res.push("");
	}
	if (codegen.pre) {
		const pre = codegen.pre($opts);
		pre && res.push(pre, "");
	}
	$opts.pre && res.push($opts.pre, "");
	for (let id in types) {
		const type = types[id];
		type.doc && codegen.doc(type.doc, res, $opts);
		codegen[type.type](<any>type, types, res, $opts);
	}
	$opts.post && res.push("", $opts.post);
	if (codegen.post) {
		const post = codegen.post($opts);
		post && res.push("", post);
	}
	return res.join("\n");
};
