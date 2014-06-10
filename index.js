

function find(array, test) {
  for(var i in array)
    if(test(array[i], i, array))
      return array[i]
}

module.exports = function (tagCodec) {

  var codecs = []

  function getRule (value) {
    return find(codecs, function (rule) { return rule.test(value) })
  }

  function _length (value, rule) {
    return (
      (tagCodec.length || tagCodec.encodingLength(rule.match))
    + (rule.codec.length || rule.codec.encodingLength(value))
    )
  }

  return {
    encode: function encode (value, buffer, offset) {
      var rule = find(codecs, function (rule) { return rule.test(value) })
      if(!rule) throw new Error('no encoding for:'+JSON.stringify(value))
      if(!buffer) {
        buffer = new Buffer(_length(value, rule))
        offset = 0
      }
      offset = offset | 0
      tagCodec.encode(rule.match, buffer, offset)
      offset += tagCodec.encode.bytesWritten
      rule.codec.encode(value, buffer, offset)
      encode.bytesWritten =
          tagCodec.encode.bytesWritten
        + rule.codec.encode.bytesWritten
      return buffer
    },
    decode: function decode (buffer, offset) {
      offset = offset | 0
      var match = tagCodec.decode(buffer, offset)
      if(match === undefined) return undefined
      var rule = find(codecs, function (e) { return e.match === match })
      offset += tagCodec.decode.bytesRead
      var value = rule.codec.decode(buffer, offset)
      decode.bytesRead =
          tagCodec.decode.bytesRead
        + rule.codec.decode.bytesRead
      return value
    },
    encodingLength: function (value) { return _length(value, getRule(value)) },
    type: function (match, codec, test) {
      codecs.push({match: match, codec: codec, test: test})
      return this
    }
  }
}
