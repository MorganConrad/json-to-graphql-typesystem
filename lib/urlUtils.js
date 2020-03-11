module.exports = { getJSOBFromURL, createHeaders };

const got = require("got");

function getJSOBFromURL(url, opts) {
   // generate an ID based on path, replacing / with _
   let nodeURL = new URL(url);
   let id = nodeURL.pathname.substr(1).replace(/\//g, "_");

   let headers = createHeaders(
     { "User-Agent": opts.UA || "json-to-graphql-typesystem" }, // always fo a User-Agent
     opts.header
   );

   return got(url, { headers })
     .then((response) => JSON.parse(response.body))
     .then(function(jsob) {
       if (Array.isArray(jsob))
         jsob = jsob[0];

       return [{ id, jsob }];
     } );
}




function createHeaders(alwaysHeader, optionalHeaders) {
  let headers = Object.assign({}, alwaysHeader);
  if (optionalHeaders) {
    if (!Array.isArray(optionalHeaders))
      optionalHeaders = [optionalHeaders];
    for (let header of optionalHeaders) {
      let colon = header.indexOf(':');
      let key = header.substr(0, colon);
      let value = header.substr(colon + 1)
      headers[key] = value;
    }
  }

  return headers;
}
