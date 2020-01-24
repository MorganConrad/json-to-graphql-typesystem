const fs = require('fs');
const path = require('path');

const gnucl = require('gnucl');
const got = require('got');

const JStoGQL = require('./json-to-graphql-typesystem');
const mongoUtils = require('./lib/mongoutils');


const USAGE = `
    [--outdir=dir]            put results into dir, which **must exist**
    [--outext=.ext]           put results into files ending with .ext
                              (if neither, results go to stdout)
    [--clean]                 try to cleanup input files (takes first {...})
    
    // three input possibilities: files, a mondoDb uri, or a JSON API url
    
    file1.json file2.json...  json files to parse and generate schemas
    
    [--uri=mongodb://...]     mongo DB to read first document of collections
    coll1 coll2...            names of collections to use (if none provided, will parse all)
    
    [--url=http://...]        read JSON from this URL
`;


let { args, opts } = gnucl(process.argv);


// make local testing easier...
if (opts.uri === 'TEST')
  opts.uri = process.env.MONGOLAB_URI;
if (opts.url === 'TEST')
  opts.url = 'https://jsonplaceholder.typicode.com/todos';

if (!args.length && !opts.uri  && !opts.url) {
  console.log("Usage: node main.js" + USAGE);
  process.exit();
}

let userBSON = {};
if (opts.BSONFile) {
  let raw = fs.readFileSync(absPath(opts.BSONFile)).toString();
  userBSON = JSON.parse(raw);
}

const js2gql = new JStoGQL(opts, userBSON);
let mongoInfo;


if (opts.uri) {  // from mongo db
  convertFromDB(opts.uri, args)
  .then((idsAndSchemas) => {
    idsAndSchemas.map(({ id, schema }) =>
      writeResult(id, schema, opts))
  })
  .then(() => {
    mongoInfo.client.close();
    doExit(0);
  })
  .catch(doExit);
}


else if (opts.url) {

  // generate an ID based on path, replacing / with _
  let nodeURL = new URL(opts.url);
  let id = nodeURL.pathname.substr(1).replace(/\//g, '_');

  got(opts.url, {
    headers: { 'User-Agent': opts.UA || 'json-to-graphql-typesystem' }
  })
    .then(function(response) {
      return opts.clean ? mongoUtils.firstBracket(response.body) : response.body;
    })
    .then((body) => JSON.parse(body))
    .then((jsob) => js2gql.convert(jsob, id))
    .then((schema) => writeResult(id, schema, opts))
    .then(() => doExit(0))
    .catch(doExit);
}


else {  // from files  (simpler, no promises)
  let idsAndSchemas = args.map((file) => convertOneFile(file, opts));
  idsAndSchemas.map(({ id, schema }) => writeResult(id, schema, opts));
  doExit(0);
}


function convertOneFile(file) {
  let id = path.basename(file, path.extname(file));
  let input = fs.readFileSync(absPath(file)).toString();
  if (opts.clean)
    input = mongoUtils.firstBracket(input);
  let jsob = JSON.parse(input);
  let schema = js2gql.convert(jsob, id);
  return { id, schema };
}


function convertFromDB(uri, collectionNames) {
  return mongoUtils.connect(uri)
    .then((info) => {
      mongoInfo = info;  // save
      if (!collectionNames.length)
        collectionNames = mongoUtils.getCollectionNames(mongoInfo.db)
      return collectionNames;
    })
    .then((names) =>
      Promise.all(names.map((name) =>
        convertOneCollection(mongoInfo.db, name)
      )))
}


function convertOneCollection(db, name) {
  return db.collection(name, opts).findOne({})
    .then((doc) => js2gql.convert(doc, name))
    .then(function(schema) { return { id: name, schema } });
}


function writeResult(id, schema, opts) {
  if (opts.outdir)
    fs.writeFileSync(path.join(absPath(opts.outdir), id + (opts.outext || ".graphql")), schema);
  else if (opts.outext)
    fs.writeFileSync(path.join(__dirname, id + opts.outext), schema);
  else {
    console.log('\n# ' + id + '\n');
    console.log(schema);
  }
  return { id, schema };
}


function absPath(inPath) {
  return path.isAbsolute(inPath) ? inPath : path.join(__dirname, inPath);
}


function doExit(err) {
  if (err) console.error(err);
  process.exit(err ? 1 : 0);
}

