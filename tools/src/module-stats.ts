import { readJSON, writeJSON } from "@thi.ng/file-io";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { LOGGER } from "./api.js";

const pkg = readJSON("package.json", LOGGER);
const deps = [
	"tslib",
	"fs",
	"child_process",
	"path",
	...Object.keys(pkg.dependencies || {}),
];
const opts = [
	"--bundle",
	"--target=es2020",
	"--format=esm",
	...deps.map((x) => `--external:${x}`),
	"index.js",
];
if (pkg.keywords.includes("nodejs") || pkg.keywords.includes("no-browser")) {
	opts.unshift("--platform=node");
}
const raw = execFileSync(
	"../../node_modules/esbuild/bin/esbuild",
	opts
).toString();
const min = execFileSync("../../node_modules/esbuild/bin/esbuild", [
	"--minify",
	...opts,
]).toString();
const brotli = execFileSync("brotli", { input: min });

const stats = {
	raw: raw.length,
	min: min.length,
	brotli: brotli.byteLength,
};

!existsSync(".meta") && mkdirSync(".meta");
// writeFileSync(".meta/raw.js", raw);
// writeFileSync(".meta/min.js", min);
writeJSON(".meta/size.json", { esm: stats }, null, 0, LOGGER);
console.log(stats);
