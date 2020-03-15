/**
 * For "unit" testing, works best if the major functionality is split out
 */

const JStoGQL = require("./json-to-graphql-typesystem");
const mongoUtils = require("./lib/mongoutils");
const fileutils = require("./lib/fileutils");

function doit(opts, args, userBSON) {
  const js2gql = new JStoGQL(opts, userBSON);

  return loadJSON(opts, args)
    .then((data) => {
      return data.map(function({ id, jsob }) {
        let schema = js2gql.convert(jsob, id);
        return { id, schema };
      })
    })
    .then((data) => {
      data.forEach(({ id, schema }) => fileutils.writeResult(id, schema, opts));
      return data;
    });
}

function loadJSON(opts, args) {
  if (opts.uri)
    return mongoUtils.getFirstDocuments(opts.uri, args);
  else
    return Promise.all(args.map((filename) => fileutils.loadJSON(filename, opts)));
}

module.exports = { doit };
