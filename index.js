'use strict'
function find (arr, test) {
  for (var i = 0; i < arr.length; ++i) {
    if (test(arr[i], i, arr)) return arr[i]
  }

  return undefined
}

module.exports = function (tagType, items) {
  items = items.map(function (codec) { return codec })

  function _length (item, value) {
    return tagType.encodingLength(item.match) + item.type.encodingLength(value)
  }

  return {
    encode: function encode (value, buffer, offset) {
      var item = find(items, function (item) { return item.test(value) })
      if (!item) throw new TypeError('no encoding for: ' + JSON.stringify(value))
      if (!buffer) buffer = new Buffer(_length(item, value))
      if (!offset) offset = 0
      tagType.encode(item.match, buffer, offset)
      var _offset = offset + tagType.encode.bytes
      item.type.encode(value, buffer, _offset)
      encode.bytes = item.type.encode.bytes + _offset - offset
      return buffer
    },
    decode: function decode (buffer, offset, end) {
      if (!offset) offset = 0
      var match = tagType.decode(buffer, offset, end)
      var item = find(items, function (item) { return item.match === match })
      if (!item) throw new TypeError('no encoding for: ' + JSON.stringify(match))
      var _offset = offset + tagType.decode.bytes
      var value = item.type.decode(buffer, _offset, end)
      decode.bytes = item.type.decode.bytes + _offset - offset
      return value
    },
    encodingLength: function (value) {
      var item = find(items, function (item) { return item.test(value) })
      if (item === undefined) throw new TypeError('no encoding for: ' + JSON.stringify(value))
      return _length(item, value)
    }
  }
}
