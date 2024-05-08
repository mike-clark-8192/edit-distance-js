import shelljs from "shelljs";
import fs from "fs";
import path from "path";
import { createRequire } from "module";
const Require = createRequire(import.meta.url);
const packageJson = Require("./package.json");
const __dirname = import.meta.dirname;
const __filename = import.meta.url;

if (process.env.EDITDISTANCEJS_NOPREPARE
    || process.env.npm_command !== "install"
    || fs.existsSync(path.join(__dirname, packageJson.types))
) {
    process.exit(0);
}

const buildCommand = "npm run build";
const result = shelljs.exec(buildCommand);
if (result.code !== 0) {
    console.log(`${__filename}: Error running command: ${buildCommand}`);
    console.log(result.stdout);
    console.log(result.stderr);
    process.exit(result.code);
}
