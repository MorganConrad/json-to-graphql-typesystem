const fs = require('fs');
const test = require('tape');
const mainHelper = require('../main_helper');
const urlutils = require('../lib/urlUtils');


test('file', function(t) {
  const expectedSchema = fs.readFileSync('./tests/data/akcschema.txt').toString();
  mainHelper.doit( {
    unitTestMode: true,
    clean: true
  }, [ '../tests/data/akc.json'])
  .then((results) => results[0])
    .then((result) => {
      t.equals(result.id, 'akc');
      t.equals(result.schema + '\n', expectedSchema);
      return t.end();
    })
    .catch((err) => { console.error(err); t.end(); });
})



test("URL", function(t) {
  mainHelper.doit( {
    unitTestMode: true,
    url: "https://jsonplaceholder.typicode.com/todos"
  }, [])
    .then((results) => results[0])
    .then((result) => {
      console.dir(result);
      t.equals(result.id, 'todos');
      t.equals(result.schema, 'type todos {\n  userId: Int\n  id: Int\n  title: String\n  completed: Boolean\n}');
      return t.end();
    })
    .catch((err) => { console.error(err); t.end(); });

});

test("URI", function(t) {
  mainHelper.doit( {
    unitTestMode: true,
    uri: process.env.MONGOLAB_URI
  }, [])
    .then((results) => results[1])  // cpe
    .then((result) => {
      console.dir(result);
      t.equals(result.id, 'cpe');
      t.equals(result.schema, 'type cpe {\n  _id: String\n  org: String\n  dates: [Date]\n  state: String\n  location: String\n  club: String\n  urls: [Id]\n  days: Date\n  longLat: [Float]\n}');
      return t.end();
    })
    .catch((err) => { console.error(err); t.end(); });
});


test("Github", function(t) {
  const expectedSchema = fs.readFileSync('./tests/data/github1schema.txt').toString();
  mainHelper.doit( {
    unitTestMode: true,
    url: "https://api.github.com/repos/vmg/redcarpet/issues?state=closed"
  }, [])
    .then((results) => results[0])
    .then((result) => {
      t.equals(result.id, 'repos_vmg_redcarpet_issues');
      t.equals(result.schema + '\n', expectedSchema);
      t.end();
    })
    .catch((err) => { console.error(err); t.end(); });
});


test("createHeaders", function(t) {
  let h = urlutils.createHeaders( { foo: 1}, "bar:bar:1");
  // console.dir(h);
  t.equals(h.foo, 1);
  t.equals(h.bar, "bar:1");
  t.end();
})

