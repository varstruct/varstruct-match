# varstruct-match

[![NPM Package](https://img.shields.io/npm/v/varstruct-match.svg?style=flat-square)](https://www.npmjs.org/package/varstruct-match)
[![Build Status](https://img.shields.io/travis/dominictarr/varstruct-match.svg?branch=master&style=flat-square)](https://travis-ci.org/dominictarr/varstruct-match)
[![Dependency status](https://img.shields.io/david/dominictarr/varstruct-match.svg?style=flat-square)](https://david-dm.org/dominictarr/varstruct-match#info=dependencies)

[![abstract-encoding](https://img.shields.io/badge/abstract--encoding-compliant-brightgreen.svg?style=flat-square)](https://github.com/mafintosh/abstract-encoding)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

create varstruct codec that can match multiple data types.

Each item encoded is prefixed with a type value, I suggest using a byte or a varint.

## Example

```js
var varmatch = require('varstruct-match')
var varstruct = require('varstruct')
var VarUIntProtobuf = require('varint')

//create some simple codecs
var foobar = varstruct([
  { name: 'foo', type: VarUIntProtobuf },
  { name: 'bar', type: VarUIntProtobuf }
])

//test functions - return true if the argument can be encoded with this codec.
function isFooBar (t) { return t && t.foo && t.bar }

function isInteger (n) { return typeof n === 'number' && n % 1 === 0 }

var codec = varmatch(VarUIntProtobuf, [
  { match: 1, type: foobar, test: isFooBar },
  { match: 2, type: varstruct.VarArray(VarUIntProtobuf, foobar), test: Array.isArray },
  { match: 3, type: VarUIntProtobuf, test: isInteger }
])


//encode with the first rule
codec.encode({ foo: 1, bar: 2 })
//=> <Buffer 01 01 02>

//encode with the second rule
codec.encode([{ foo: 1, bar: 2 }, { foo: 3, bar: 4 }, { foo: 5, bar: 6 }])
//=> <Buffer 02 03 01 02 03 04 05 06>

//encode with the third rule
codec.encode(7)
//=> <Buffer 03 07>
```

once the codec is defined, you can just pass any valid object.

## API

### varmatch(tagCodec, [typeCodec1, typeCodec2, ..., typeCodecN])

create an instance, specifying the codec for the matching field.

## License

MIT
