const fs = require("fs");
const path = require("path");

// TODO readasync
function loadFile(file, opts = {}) {
  let id = path.basename(file, path.extname(file));
  let input = fs.readFileSync(absPath(file)).toString();
  if (opts.clean) input = firstBracket(input);
  let jsob = JSON.parse(input);
  if (Array.isArray(jsob))
    jsob = jsob[0];
  return { id, jsob };
}


function writeResult(id, schema, opts) {
  if (opts.unitTestMode)
    return;
  if (opts.outdir) {
    fs.writeFileSync(
      path.join(absPath(opts.outdir), id + (opts.outext || ".graphql")),
      schema
    );
  }
  else if (opts.outext)
    fs.writeFileSync(path.join(__dirname, id + opts.outext), schema);
  else {
    console.log("\n# " + id + "\n");
    console.log(schema);
  }
}

function absPath(inPath) {
  return path.isAbsolute(inPath) ? inPath : path.join(__dirname, inPath);
}

/**
 * MondoDB Compass exports a table as a bunch of {...}{...} NOT separated by commas
 * This Grabs the first bracket.  Not very robust
 *
 * @param weirdJSON
 * @returns {string}
 */
function firstBracket(multiJSON) {
  let idx = 0;
  while (multiJSON[idx] !== '{')
    idx++;
  let depth = 1;
  let result = '{';
  while (depth) {
    let c = multiJSON[++idx];
    result += c;
    if (c === '{')
      depth++;
    else if (c === '}')
      depth--;
  }

  return result;
}


module.exports = { loadFile, writeResult, absPath }
