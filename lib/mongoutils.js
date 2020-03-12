/**
 * Utilities related to Mongo DB
 */

const MongoClient = require("mongodb").MongoClient;

/**
 * Connect to a mongoDB
 * @param uri
 * @param options
 * @returns {Promise<{ client: MongoClient, db: the db} >}
 */
function connect(uri, options = {}) {
  options.useUnifiedTopology = true; // avpid annoying warning
  return MongoClient.connect(uri, options).then((client) => {
    let db = client.db();
    return { client, db };
  });
}

/**
 * Get all non system collection names
 * @param db
 * @param filter  additional query filtering, default = {}
 * @returns {Promise<[String]>}
 */
function getCollectionNames(db, filter = {}) {
  return db
    .listCollections(filter, { nameOnly: true })
    .toArray()
    .then((cArray) => cArray.map((c) => c.name))
    .then((nameArray) => nameArray.filter((n) => !n.includes("system.")));
}

function getFirstDocuments(uri, collectionNames) {
  let _info;
  return connect(uri)
    .then((info) => {
      _info = info;
      if (!collectionNames.length)
        collectionNames = getCollectionNames(_info.db);
      return collectionNames;
    })
    .then((names) =>
      Promise.all(names.map((name) => loadCollection(_info.db, name)))
    )
    .then((documents) => {
      _info.client.close();
      return documents;
    });
}

function loadCollection(db, id, opts) {
  return db
    .collection(id, opts)
    .findOne({})
    .then(function(jsob) {
      return { id, jsob };
    });
}

module.exports = { connect, getCollectionNames, getFirstDocuments };
