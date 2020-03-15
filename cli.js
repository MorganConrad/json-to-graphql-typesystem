#!/usr/bin/env node

const gnucl = require("gnucl");

const fileutils = require("./lib/fileutils");
const helper = require("./cli_helper");

const USAGE = `
    [--outdir=dir]            put results into dir, which **must exist**
    [--outext=.ext]           put results into files ending with .ext
                              (if neither, results go to stdout)
    [--clean]                 try to cleanup input files (takes first {...})
    [--suffix=!]              add a ! after every non-null field
    [--nullData=xxx]          the "type" to use if the example data is null.  default = "TBD"
    [--id=typename]           use this for the root "type".  Otherwise, filename or collection name will be used

    // two input possibilities: files or a mondoDb uri

    file1.json file2.json...  json files to parse and generate schemas
                              '-' means read from stdin

    [--uri=mongodb://...]     mongo DB to read first document of collections
    coll1 coll2...            names of collections to use (if none provided, will parse all)
`;

let { args, opts } = gnucl(process.argv);

// make local testing easier...
if (opts.uri === "TEST") opts.uri = process.env.MONGOLAB_URI;

if (!args.length && !opts.uri && !opts.url) {
  console.log("Usage: node main.js" + USAGE);
  process.exit();
}

let userBSON;
if (opts.BSONFile) {
  let raw = fileutils.readFileSync(fileutils.absPath(opts.BSONFile));
  userBSON = JSON.parse(raw);
}

helper
  .doit(opts, args, userBSON)
  .then(() => doExit(0))
  .catch(doExit);


function doExit(err) {
  if (err) console.error(err);
   process.exit(err ? 1 : 0);
}
