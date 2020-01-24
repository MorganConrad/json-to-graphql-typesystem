/**
 * Utilities related to Mongo DB
 */

const MongoClient = require('mongodb').MongoClient;

/**
 * Connect to a mongoDB
 * @param uri
 * @param options
 * @returns {Promise<{ client: MongoClient, db: the db} >}
 */
function connect(uri, options = {}) {
  options.useUnifiedTopology = true;  // avpid annoying warning
  return MongoClient.connect(uri, options )
  .then((client) => {
    let db = client.db();
    return { client, db };
  })
}


/**
 * Get all non system collection names
 * @param db
 * @param filter  additional query filtering, default = {}
 * @returns {Promise<[String]>}
 */
function getCollectionNames(db, filter = {}) {
  return db.listCollections(filter, { nameOnly: true }).toArray()
  .then((cArray) =>
    cArray.map((c) => c.name))
  .then((nameArray) =>
    nameArray.filter((n) => !n.includes('system.')));
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


module.exports = { connect, getCollectionNames, firstBracket };
