const fs = require("fs");
const path = require("path");


function readFileSync(file) {
  return fs.readFileSync(absPath(file), 'utf-8').toString();
}


/**
 * Promise to read a file in utf-8
 * @param {String} file   null or '-' = stdin
 * @param {*} options
 */
function readP(file) {
  let stream = (file && (file !== '-')) ?
    fs.createReadStream(absPath(file)) :
    process.stdin;

  let result = '';

  return new Promise((resolve, reject) => {

    stream.on('data', (chunk) => result += chunk);

    stream.on('end', () => resolve(result));

    stream.on('error', (err) => reject(err));
  });
}


function loadJSON(file, opts = {}) {
  let id = opts.id || ((file === '-') ? 'stdin' : path.basename(file, path.extname(file)));
  return readP(file)
    .then((input) => {
      if (opts.clean)
        input = firstBracket(input);
      let jsob = JSON.parse(input);
     // console.log('hi there'); console.dir(jsob);
      if (Array.isArray(jsob))
        jsob = jsob[0];

      return { id, jsob };
    })
}

function writeResult(id, schema, opts) {
  if (opts.unitTestMode) return;
  if (opts.outdir) {
    fs.writeFileSync(
      path.join(absPath(opts.outdir), id + (opts.outext || ".graphql")),
      schema
    );
  } else if (opts.outext)
    fs.writeFileSync(path.join('.', id + opts.outext), schema);
  else {
    console.log("\n# " + id + "\n");
    console.log(schema);
  }
}

function absPath(inPath) {
  return path.isAbsolute(inPath) ? inPath : path.join('.', inPath);
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
  while (multiJSON[idx] !== "{") idx++;
  let depth = 1;
  let result = "{";
  while (depth) {
    let c = multiJSON[++idx];
    result += c;
    if (c === "{") depth++;
    else if (c === "}") depth--;
  }

  return result;
}



module.exports = { loadJSON, readFileSync, readP, writeResult, absPath };
