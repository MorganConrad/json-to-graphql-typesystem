// @see https://github.com/mongodb/specifications/blob/master/source/extended-json.rst
const BSON_CONVERSIONS = {
  $oid: "Objectid",
  $symbol: "Symbol",
  $numberInt: "Int32",
  $numberLong: "Int64",
  $numberDouble: "Double",
  $numberDecimal: "Decimal128",
  $binary: "Binary",
  $code: "Code",
  $timestamp: "Timestamp",
  $regularExpression: "Regular Expression",
  $dbPointer: "DBPointer",
  $date: "Datetime",
  $ref: "DBRef",
  $minKey: "MinKey",
  $maxKey: "MaxKey",
  $undefined: "Undefined",
};

const DEFAULT_OPTIONS = {
  rootType: "RootType",
  bson_prefix: "BSON_",
  eol: "\n",
  nestedDelimiter: "_",
  nullData: "TBD",
  suffix: "",
};

class JSONToGraphQLTS {
  constructor(userOptions, userBSON) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, userOptions);
    let useStandardBson = this.options.BSON ? BSON_CONVERSIONS : {};
    this.bson = Object.assign({}, useStandardBson, userBSON);
  }

  convert(data, rootType = "rootType") {
    let converted = this.convertToHash(data, rootType);
    return Object.values(converted).join("\n");
  }

  convertToHash(data, rootType) {
    data = data || {};
    rootType = rootType || this.options.rootType;
    this.all = {};
    this.all[rootType] = this.r(rootType, data);
    return this.all;
  }

  r(type, data) {
    let elements = Object.keys(data).map((key) =>
      this.r1(type, key, data[key])
    );
    elements.push("}");
    elements.unshift("type " + type + " {");
    return elements.join(this.options.eol);
  }

  r1(type, field, data) {
    let dataType = this.dataType(type, field, data);
    return this._buildline(field, dataType);
  }

  dataType(type, field, data) {
    let primitiveType = this._primitive(data);
    if (primitiveType) return primitiveType;
    if (Array.isArray(data))
      return "[" + this.dataType(type, field, data[0]) + "]";
    let mongoType = this._mongoType(data);
    if (mongoType) return mongoType;

    // unknown nested type
    let newType = type + this.options.nestedDelimiter + field;
    this.all[newType] = this.r(newType, data);
    return newType;
  }

  _mongoType(data) {
    // console.dir(data);
    let keys = Object.keys(data);
    if (!keys || keys.length !== 1) return null;

    let bson = this.bson[keys[0]];
    return bson ? this.options.bson_prefix + bson : null;
  }

  _primitive(data) {
    if (data == null) return this.options.nullData;
    let type = typeof data;
    if (type === "string") return this._isSpecialString(data) || "String";
    if (type === "boolean") return "Boolean";
    if (Number.isFinite(data)) return Number.isInteger(data) ? "Int" : "Float";
    if (data instanceof Date) return "Date";
    return null;
  }

  // TODO, add more???
  _isSpecialString(s) {
    if (s.toLowerCase().startsWith("http")) return "Id";
    if (Date.parse(s) >= 0) return "Date";

    return null;
  }

  _buildline(field, type) {
    let line = "  " + field + ": " + type;
    if (this.options.suffix && type !== this.options.nullData)
      line += this.options.suffix;

    return line;
  }
}

module.exports = JSONToGraphQLTS;
