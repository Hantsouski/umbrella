import { unionR } from "@thi.ng/associative";
import { compareByKeys2 } from "@thi.ng/compare";
import { files, readJSON, readText } from "@thi.ng/file-io";
import {
	assocObj,
	comp,
	conj,
	filter,
	keys,
	map,
	mapcat,
	transduce,
} from "@thi.ng/transducers";
import { readdirSync, statSync } from "node:fs";
import { LOGGER } from "./api.js";
import { shortName } from "./partials/package.js";

const RE_IMPORT = /\}? from "(?!\.)([a-z0-9@/.-]+)";/;

const xform = comp(
	mapcat((f: string) => readText(f, LOGGER).split("\n")),
	filter((line) => !/^\s+\*\s/.test(line)),
	map((line) => RE_IMPORT.exec(line)),
	filter((x) => !!x),
	map((x) =>
		x![1].indexOf("@thi.ng") === 0
			? x![1].split("/").slice(0, 2).join("/")
			: x![1]
	)
);

const usedDependencies = (rootDir: string) =>
	transduce(xform, conj(), files(rootDir, ".ts"));

const updateImports = (root: string, latest = false) => {
	console.log(root);
	const pkgPath = root + "/package.json";
	const deps = usedDependencies(root + "/src");
	const pkg = readJSON(pkgPath);
	!pkg.dependencies && (pkg.dependencies = {});
	const mergedDeps = unionR<string>([deps, keys(pkg.dependencies)]);
	let edit = false;
	const pairs: [string, string][] = [];
	for (let d of mergedDeps) {
		if (!d.startsWith("@thi.ng")) continue;
		if (deps.has(d) && !pkg.dependencies[d]) {
			const depPkg = readJSON(`packages/${shortName(d)}/package.json`);
			pairs.push([d, latest ? "workspace:^" : `^${depPkg.version}`]);
			edit = true;
		} else if (!deps.has(d)) {
			delete pkg.dependencies[d];
			edit = true;
		} else {
			pairs.push([d, pkg.dependencies[d]]);
		}
	}
	if (edit) {
		const result = assocObj(pairs.sort(compareByKeys2(0, 1)));
		console.log(JSON.stringify(result, null, 2));
		process.exit(1);
	} else {
		console.log("ok");
	}
};

const updateProjects = (parent: string, latest = false) => {
	for (let pkg of readdirSync(parent)) {
		pkg = `${parent}/${pkg}`;
		if (statSync(pkg).isDirectory()) {
			try {
				updateImports(pkg, latest);
			} catch (e) {
				console.warn("\terror processing package", pkg);
			}
		}
	}
};

const project = process.argv[2];

project
	? project === "examples"
		? updateProjects("examples", true)
		: updateImports(project, project.startsWith("examples"))
	: updateProjects("packages");
