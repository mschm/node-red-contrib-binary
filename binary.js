/**
 * Copyright 2016 Marius Schmeding
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    "use strict"
    var packet = require("packet")
    var typeOf = require("typeof")

    function BinaryNode(n) {
        RED.nodes.createNode(this, n)

        var parser, serializer, node

        // create parser object and define pattern
        parser = packet.createParser()
        parser.packet("payload", n.pattern)

        // create serializer with the same pattern
        serializer = parser.createSerializer()

        node = this

        this.sendMessage = function(payload, message){
            // create message
            var m = RED.util.cloneMessage(message)
            m.payload = payload
            node.send(m)
        }
        this.on("input", function(msg) {
            if (msg.hasOwnProperty("payload")) {

                node.status({fill:"yellow",shape:"dot",text:"processing"});
                var t = typeOf(msg.payload)
                if (t == "object") { // serialize object
                    try {
                        serializer.serialize("payload", msg.payload)
                        var buf = new Buffer(serializer.sizeOf)
                        serializer.write(buf)
                        node.sendMessage(buf,msg)
                        node.status({fill:"green",shape:"dot",text:"serialize: done"});
                    } catch (e) {
                        node.error(e)
                        node.status({fill:"red",shape:"dot",text:"serialize: failed"});
                    }

                } else if (t == "buffer") { // parse buffer
                    try {
                        parser.extract("payload", function(result) {
                            if (JSON.stringify(result) !== "{}") {
                                node.sendMessage(result,msg)
                                node.status({fill:"green",shape:"dot",text:"parse: done"});
                            }
                        })
                        parser.parse(msg.payload)
                    } catch (e) {
                        node.error(e)
                        node.status({fill:"red",shape:"dot",text:"parse: failed"});
                    }

                } else {
                    node.warn("Input must be buffer or object type")
                    node.status({fill:"red",shape:"dot",text:"invalid input"});
                }
            }
        })
    }
    RED.nodes.registerType("binary", BinaryNode)
}
