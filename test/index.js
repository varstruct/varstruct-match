var tap = require('tap')
var varstruct = require('varstruct')
var VarUIntProtobuf = require('varint')

var varmatch = require('../')

var foobar = varstruct([
  { name: 'foo', type: varstruct.UInt32BE },
  { name: 'bar', type: varstruct.VarString(varstruct.UInt8) }
])

function isFooBar (t) {
  return t && t.foo && t.bar
}

function isInteger (n) {
  return typeof n === 'number' && Math.round(n) === n
}

var codec = varmatch(VarUIntProtobuf, [
  { match: Math.pow(10, 0), type: foobar, test: isFooBar },
  { match: Math.pow(10, 3), type: varstruct.VarArray(varstruct.UInt8, foobar), test: Array.isArray },
  { match: Math.pow(10, 6), type: VarUIntProtobuf, test: isInteger }
])

tap.test('encode', function (t) {
  t.test('no encoding for: null', function (t) {
    t.throws(function () {
      codec.encode(null)
    }, new TypeError('no encoding for: null'))
    t.end()
  })

  t.test('encode foobar', function (t) {
    var buf = codec.encode({ foo: 42, bar: 'answer' })
    t.same(codec.encode.bytes, 12)
    t.same(buf.toString('hex'), '010000002a06616e73776572')
    t.end()
  })

  t.test('encode integer', function (t) {
    var buf = new Buffer([0x00].concat(new Array(4)))
    t.ok(codec.encode(42, buf, 1) === buf)
    t.same(codec.encode.bytes, 4)
    t.same(buf.toString('hex'), '00c0843d2a')
    t.end()
  })

  t.end()
})

tap.test('decode', function (t) {
  t.test('no encoding for: 1', function (t) {
    t.throws(function () {
      codec.decode(new Buffer([0x0a]))
    }, new TypeError('no encoding for: 10'))
    t.end()
  })

  t.test('decode foobar', function (t) {
    var buf = new Buffer('010000002a06616e73776572', 'hex')
    t.same(codec.decode(buf), { foo: 42, bar: 'answer' })
    t.same(codec.decode.bytes, 12)
    t.end()
  })

  t.test('decode integer', function (t) {
    var buf = new Buffer('00c0843d2a', 'hex')
    t.same(codec.decode(buf, 1), 42)
    t.same(codec.decode.bytes, 4)
    t.end()
  })

  t.end()
})

tap.test('encodingLength', function (t) {
  t.test('no encoding for: null', function (t) {
    t.throws(function () {
      codec.encodingLength(null)
    }, new TypeError('no encoding for: null'))
    t.end()
  })

  t.test('should return right length', function (t) {
    t.same(codec.encodingLength(1), 4)
    t.end()
  })

  t.end()
})
