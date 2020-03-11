/**
 * For "unit" testing, works best if the major functionality is split out
 */

const JStoGQL = require("./json-to-graphql-typesystem");
const mongoUtils = require("./lib/mongoutils");
const urlUtils = require("./lib/urlUtils");
const fileutils = require("./lib/fileutils");


function doit(opts, args, userBSON) {
  const js2gql = new JStoGQL(opts, userBSON);

  return loadData(opts, args)
    .then((data) => data.map(function({ id, jsob }) {
      let schema = js2gql.convert(jsob, id);
      return { id, schema };
    }))
    .then((data) => {
      data.forEach(({ id, schema }) => fileutils.writeResult(id, schema, opts));
      return data;
    });
}



function loadData(opts, args) {
  if (opts.uri)
    return mongoUtils.getFirstDocuments(opts.uri, args);
  else if (opts.url)
    return urlUtils.getJSOBFromURL(opts.url, opts);

  else {
    return Promise.resolve(args)
      .then((filenames) => filenames.map((filename) => fileutils.loadFile(filename, opts)));
  }
}



module.exports = { doit };
