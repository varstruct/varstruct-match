var varstruct = require('varstruct')
var varint = varstruct.varint

var varmatch = require('../')

var foobar =
  varstruct({
    foo: varint,
    bar: varint
  })

function isFooBar (t) {
  return t.foo && t.bar
}

function isInteger(n) {
  return 'number' === typeof n && Math.round(n) === n
}

var codec = varmatch(varint)
  .type(100, foobar, isFooBar)
  .type(200, varstruct.vararray(varint, foobar), Array.isArray)
  .type(300, varint, isInteger)

var tape = require('tape')

var expected = [
  {foo: 1, bar: 2},
  [
    {foo: 1, bar: 2},
    {foo: 3, bar: 4},
    {foo: 5, bar: 6},
  ],
  1,
  2,
  3
]

expected.forEach(function (e) {

  tape('encode/decode:' + JSON.stringify(e), function (t) {
    var buffer = codec.encode(e)
    console.log('encoded:', buffer)
    t.equal(buffer.length, codec.encode.bytes)
    console.log('decoded:', codec.decode(buffer))

    t.deepEqual(codec.decode(buffer), e)
    t.equal(buffer.length, codec.decode.bytes)
    t.end()
  })
})

tape('encode/decode all', function (t) {
  var allcodec = varstruct.vararray(varint, codec)
  var buffer = allcodec.encode(expected)
  t.equal(buffer.length, allcodec.encode.bytes)
  t.deepEqual(allcodec.decode(buffer), expected)
  t.equal(buffer.length, allcodec.decode.bytes)
  t.end()
})
