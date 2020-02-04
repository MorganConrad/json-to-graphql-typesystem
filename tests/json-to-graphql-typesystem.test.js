const fs = require('fs');
const test = require('tape');
const JSONToGraphQLTS = require('../json-to-graphql-typesystem');

function readFile(name) {
  return fs.readFileSync("./tests/data/" + name);
}


test("nulldata", function(t) {
  let result = new JSONToGraphQLTS().convert();
  t.equals(result, 'type rootType {\n}');
  t.end();
});


test("akc1", function(t) {
  let data = JSON.parse(readFile("akc1.json"));
  let j2g = new JSONToGraphQLTS( { BSON: true } );
  let result = j2g.convert(data);
  let lines = result.split('\n');
  t.equals(lines.length, 13);
  t.equals(lines[2], '  dates: [BSON_Datetime]');
  // console.dir(result);

  t.end();
});

test("nested", function(t) {
  let data = JSON.parse(readFile("nested.json"));

  let j2g = new JSONToGraphQLTS( { nullData: "NULL", suffix: '!' });
  let result = j2g.convertToHash(data);

  let values = Object.values(result);
  t.equals(values.length, 3);
  t.equals(result.RootType_genres, 'type RootType_genres {\n  id: Int!\n  name: String!\n}');
  t.true(result.RootType_belongs_to_collection.includes("testNull: NULL\n"));  // no !

  t.end();
});

