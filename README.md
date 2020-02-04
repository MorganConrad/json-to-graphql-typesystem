[![Build Status](https://secure.travis-ci.org/MorganConrad/json-to-graphql-typesystem.png)](http://travis-ci.org/MorganConrad/json-to-graphql-typesystem)
[![License](http://img.shields.io/badge/license-MIT-A31F34.svg)](https://github.com/MorganConrad/json-to-graphql-typesystem)
[![Known Vulnerabilities](https://snyk.io/test/github/morganconrad/json-to-graphql-typesystem/badge.svg)](https://snyk.io/test/github/morganconrad/json-to-graphql-typesystem)
[![Coverage Status](https://coveralls.io/repos/github/MorganConrad/json-to-graphql-typesystem/badge.svg)](https://coveralls.io/github/MorganConrad/json-to-graphql-typesystem)



# json-to-graphql-typesystem
Convert json data to GraphQL type system

Turn this [Star Wars SWAPI.co data](https://swapi.co/api/people/1)

```
{
	"name": "Luke Skywalker",
	"height": "172",
	"mass": "77",
	"hair_color": "blond",
	"skin_color": "fair",
	"eye_color": "blue",
	"birth_year": "19BBY",
	"gender": "male",
	"homeworld": "https://swapi.co/api/planets/1/",
	"films": [
		"https://swapi.co/api/films/2/",
		"https://swapi.co/api/films/6/",
		"https://swapi.co/api/films/3/",
		"https://swapi.co/api/films/1/",
		"https://swapi.co/api/films/7/"
	],
	"species": [
		"https://swapi.co/api/species/1/"
	],
	"vehicles": [
		"https://swapi.co/api/vehicles/14/",
		"https://swapi.co/api/vehicles/30/"
	],
	"starships": [
		"https://swapi.co/api/starships/12/",
		"https://swapi.co/api/starships/22/"
	],
	"created": "2014-12-09T13:50:51.644000Z",
	"edited": "2014-12-20T21:17:56.891000Z",
	"url": "https://swapi.co/api/people/1/"
}

```

into this:

```
type api_people_1 {
  name: String
  height: String
  mass: Date
  hair_color: String
  skin_color: String
  eye_color: String
  birth_year: String
  gender: String
  homeworld: Id
  films: [Id]
  species: [Id]
  vehicles: [Id]
  starships: [Id]
  created: Date
  edited: Date
  url: Id
}
```

## Quick Usage

```
> git clone https://github.com/MorganConrad/json-to-graphql-typesystem.git

> cd json-to-graphql-typesystem

> node main.js --url=https://swapi.co/api/people/1
    results shown above

> node main.js --uri=mongodb://user:password@host:port/database?options
    converts all collections of that database
    
> node main.js file1.json file2.json  (try ./tests/data/nested.json)
    converts the given json files
```

## main.js   CLI

```
  [--outdir=dir]            put results into dir, which **must exist**
  [--outext=.ext]           put results into files ending with .ext
                          (if neither, results go to stdout)
  [--clean]                 try to cleanup input files (takes first {...})
    
  // three input possibilities: files, a mondoDb uri, or a JSON API url
    
  file1.json file2.json...  json files to parse and generate schemas
    
  [--uri=mongodb://...]     mongo DB (reads first document of collections)
  coll1 coll2...            names of collections to use (if none provided, will parse all)
   
  [--url=http://...]        GET JSON from this URL
  [--header=X-Foo:Bar]      add this header (may appear multiple times on command line)
```

### Obscure Options

 - --UA=foo         use this for User-Agent on urls  default = 'json-to-graphql-typesystem'

The following options only apply if the files were exported by something like by Mongo DB Compass.  See tests/data/akc.json for an example.
These files contain additional typing details such as `{"$date":{"$numberLong":"1397952000000"}}`.

 - --BSON           use the standard conversions (see json-to-graphql-typesystem.BSON_CONVERSIONS)
 - --BSONFile=name  use conversions read from this JSON file
 - --clean          Since the exports are not in proper JSON format, this corrects them


## JSONToGraphQLTS

Module that does the actual conversion of an **object** into a string graphql type representation

### constructor(userOptions, userBSON)
 - userOptions described [below](#useroptions)
 - userBSON    additional BSON types

### convert(data, rootType)
 - data:    Javascript object  (non-null)
 - rootType the name of the Type for this root of this object
 
Returns a nicely formatted String, possibly including nested types, _e.g._

```
type rootType_belongs_to_collection {
  id: Int
  name: String
  poster_path: String
  backdrop_path: String
}
type rootType_genres {
  id: Int
  name: String
}
type rootType {
  adult: Boolean
  backdrop_path: String
  belongs_to_collection: rootType_belongs_to_collection
  budget: Int
  genres: [rootType_genres]
}
```

#### userOptions
 - BSON              use standard BSON types
 - bson_prefix       additional prefix for any BSON types, default = 'BSON_'
 - eol               default '\n',
 - nestedDelimiter   how to delimit nested classes, default '_'


## Notes, Changes, Todos, and Caveats

 1) v0.1.1 added the --header option.
