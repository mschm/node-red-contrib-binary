'use strict'
var RED
var packet = require('packet')
var typeOf = require('typeof')

function BinaryNode (node, pattern) {
    var parser, serializer

    this.node = node

    // create parser object and define pattern
    parser = packet.createParser()
    parser.packet('payload', pattern)
    this.parser = parser

    // create serializer with the same pattern
    serializer = parser.createSerializer()
    this.serializer = serializer
}

BinaryNode.prototype.handleInputEvent = function (msg) {
    var value = RED.util.getMessageProperty(msg,this.node.property);
    if (value !== undefined) {
    // if (msg.hasOwnProperty('payload')) {
        var t = typeOf(value)
        if (t == 'object') { // serialize object
            this.serializer.serialize('payload', value)
            var buf = new Buffer.alloc(this.serializer.sizeOf)
            this.serializer.write(buf)
            this._sendMessage(buf, msg)
        } else if (Buffer.isBuffer(value)) { // parse buffer
            var foo = this
            this.parser.extract('payload', function (result) {
                if (JSON.stringify(result) !== '{}') {
                    foo._sendMessage(result, msg)
                }
            })
            this.parser.parse(value)
        } else {
            throw new Error('invalid input')
        }
    }
}

BinaryNode.prototype.handleCloseEvent = function () {}

BinaryNode.prototype._sendMessage = function (payload, msg) {
    // create message
    var m = RED.util.cloneMessage(msg);
    if (this.node.pattern.split(",").length === 1) {
        if (this.node.pattern.split("=>").length <= 1) {
            RED.util.setMessageProperty(m,this.node.property,payload);
        }
        else {
            RED.util.setMessageProperty(m,this.node.property,payload[this.node.pattern.split("=>")[1].trim()]);
        }
    }
    else {
        RED.util.setMessageProperty(m,this.node.property,payload);
    }
    m.original = msg.payload;
    this.node.send(m)
}

module.exports = function (runtime) {
    RED = runtime
    return BinaryNode
}
