const fs = require("fs");
const gnucl = require("gnucl");

const fileutils = require("./lib/fileutils");
const helper = require("./main_helper");

const USAGE = `
    [--outdir=dir]            put results into dir, which **must exist**
    [--outext=.ext]           put results into files ending with .ext
                              (if neither, results go to stdout)
    [--clean]                 try to cleanup input files (takes first {...})
    [--suffix=!]              add a ! after every non-null field

    // three input possibilities: files, a mondoDb uri, or a JSON API url

    file1.json file2.json...  json files to parse and generate schemas

    [--uri=mongodb://...]     mongo DB to read first document of collections
    coll1 coll2...            names of collections to use (if none provided, will parse all)

    [--url=http://...]        read JSON from this URL
    [--header=Foo:Bar]        add this header (may be multiple times on command line)
`;

let { args, opts } = gnucl(process.argv);

// make local testing easier...
if (opts.uri === "TEST") opts.uri = process.env.MONGOLAB_URI;
if (opts.url === "TEST")
  opts.url = "https://jsonplaceholder.typicode.com/todos";

if (!args.length && !opts.uri && !opts.url) {
  console.log("Usage: node main.js" + USAGE);
  process.exit();
}

let userBSON;
if (opts.BSONFile) {
  let raw = fs.readFileSync(fileutils.absPath(opts.BSONFile)).toString();
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
