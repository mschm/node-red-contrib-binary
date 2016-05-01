'use strict'
var RED = {
  settings: {},
  util: { cloneMessage: function (message) {return message}
  }
}

var Binary = require('../lib/BinaryNode')(RED)
var assert = require('assert')
var typeOf = require('typeof')

describe('Environment:', function () {
  it('is ready', function () {
    assert(Binary)
  })
})

describe('BinaryNode:', function () {
  var node = {
    messageSent: null,
    send: function (message) {this.messageSent = message}
  }
  var pattern = 'b8 => integer, b32f => float'
  var bin = new Binary(node, pattern)

  beforeEach(function () {
    node.messageSent = null
  })

  it('is created', function () {
    assert(bin.parser)
    assert(bin.serializer)
  })

  it('empty message', function () {
    var msg = {} // must have payload
    bin.handleInputEvent(msg)
    assert(node.messageSent == null)
  })

  it('invalid input', function () {
    var msg = {payload: 'invalid'} // must be object or buffer
    assert.throws(
      function () { bin.handleInputEvent(msg) },
      /invalid input/
    )
  })

  it('valid input', function () {
    var msg = {payload: {integer: 1, float: 2.5}}
    bin.handleInputEvent(msg)
    assert(node.messageSent != null)
  })

  it('valid serialization', function () {
    var msg = {payload: {integer: 1, float: 2.5}}
    bin.handleInputEvent(msg)
    var t = typeOf(node.messageSent.payload)
    assert.strictEqual(t, 'buffer')
    var ref = new Buffer('0100002040', 'hex')
    assert.equal(node.messageSent.payload.compare(ref), 0)
  })

  it('valid parsing', function () {
    var msg = {payload: new Buffer('0100002040', 'hex')}
    bin.handleInputEvent(msg)
    var t = typeOf(node.messageSent.payload)
    assert.strictEqual(t, 'object')
    assert.equal(node.messageSent.payload.integer, 1)
    assert.equal(node.messageSent.payload.float, 2.5)
  })
})
