import { deleteFile, readJSON, tempFilePath, writeText } from "@thi.ng/file-io";
import { getIn } from "@thi.ng/paths";
import { execFileSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { LOGGER } from "./api.js";

const baseDir = "./packages/";
const tmpFile = tempFilePath();

for (let f of readdirSync(baseDir)) {
	f = baseDir + f;
	if (f.indexOf(".DS_Store") >= 0 || !statSync(f).isDirectory) continue;
	try {
		const pkg = readJSON(f + "/package.json", LOGGER);
		const id = pkg.name.split("/")[1];
		if (getIn(pkg, ["thi.ng", "shortlink"]) === false) {
			console.log(`\tskipping: ${id}`);
			continue;
		}
		const branch = getIn(pkg, ["thi.ng", "branch"]) || "develop";
		const html = `<html><head><meta http-equiv="refresh" content="0; url=https://github.com/thi-ng/umbrella/tree/${branch}/packages/${id}"/></head></html>`;
		console.log(`${id} -> ${branch}`);
		writeText(tmpFile, html);
		execFileSync(
			"aws",
			`s3 cp ${tmpFile} s3://thi.ng/${id} --profile thing-umbrella --acl public-read --content-type text/html --cache-control no-cache`.split(
				" "
			)
		);
	} catch (e) {
		console.warn(`error: ${(<Error>e).message}`);
	}
}

deleteFile(tmpFile, LOGGER);
