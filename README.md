# varstruct-match

create varstruct codec that can match multiple data types.

Each item encoded is prefixed with a type value,
I suggest using a byte or a varint.

## Example

``` js
var varmatch = require('varstruct-match')
var varstruct = require('varstruct')

//create some simple codecs
var foobar =
  varstruct({
    foo: varint,
    bar: varint
  })

//test functions - return true if the argument can
//be encoded with this codec.
function isFooBar (t) {
  return t.foo && t.bar
}

function isInteger(n) {
  return 'number' === typeof n && Math.round(n) === n
}

var codec = varmatch(varint)
  .type(1, foobar, isFooBar)
  .type(2, varstruct.vararray(varint, foobar), Array.isArray)
  .type(3, varint, isInteger)


//encode with the first rule
codec.encode({foo: 1, bar: 2})
//=> <Buffer 01 01 02>

//encode with the second rule
codec.encode([{foo: 1, bar: 2}, {foo: 3, bar: 4}, {foo: 5, bar: 6}])
//=> <Buffer 02 06 01 02 03 04 05 06>

//encode with the third rule
codec.encode(7)
//=> <Buffer 03 07>
```

once the codec is defined, you can just pass any valid object.

## API

### varmatch(tagCodec)

create an instance, specifying the codec for the matching field.

## License

MIT
