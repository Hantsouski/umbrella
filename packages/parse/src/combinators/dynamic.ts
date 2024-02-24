import type { Nullable } from "@thi.ng/api";
import type { DynamicParser, Parser } from "../api.js";
import type { ParseContext } from "../context.js";

/**
 * Returns a parser function placeholder, whose implementation can be
 * set at a later stage via calling `.set()`.
 *
 * @examples
 * ```ts
 * import { defContext, dynamic } from "@thi.ng/parse";
 *
 * const parser = dynamic<string>();
 * parser.set(lit("a"));
 *
 * parser(defContext("a"));
 * // true
 * ```
 */
export const dynamic = <T = string>(): DynamicParser<T> => {
	let impl: Nullable<Parser<T>>;
	const wrapper: any = (ctx: ParseContext<T>) => (impl ? impl(ctx) : false);
	wrapper.set = (p: Parser<T>) => (impl = p);
	return wrapper;
};
