node-red-contrib-binary
=======================

<a href="http://nodered.org" target="_new">Node-RED</a> function that takes the <b>msg.payload</b> and converts it to/from binary data.

Installation
------------

Either use the Manage Palette option in the Node-RED Editor menu, or run the following command in your Node-RED user directory - typically `~/.node-red`

        npm i node-red-contrib-binary

Usage
-----

If the input is a buffer it tries to parse it and creates a javascript object.
If the input is a javascript object it tries to serialize it and creates a buffer.

Pattern language
----------------

The pattern language is specified by the underlying module <a href="https://github.com/bigeasy/packet">packet</a>.

## Quick ref

 - b16 - big endian integer 16 bits (2 bytes)
 - l32 - little endian integer 32 bits (4 bytes)
 - x16 - ignore next 16 bits ((2 bytes))
 - -b8 - signed integer 8 bits (1 byte)
 - b64f - big endian double float - IEEE 754
 - l32f - little endian single float

 - l128a - 128 bits (16 byte array)
 - b8z - zero (0x00) terminated byte array
 - b16{b3,x6,-b7} - 16 bits, structured as 3 bits, ignore 6, signed 7 bit int
 - see  the ref doc for more patterns.

## Example

The pattern is setup as a comma separated set of fields, the binary side first and the json field name second.

    x8,  b8 => len,  l24a => id,  b8[4] => tag,  b8 => status,  b16 => volt,  b16 => temp,  b8 => hum,  b8 => crc,  x8

This would create an object like:

    {
        len: 13,
        id: [0x12,0x34,0x56],
        tag: [0xde,0xad,0xbe,0xef]],
        status: 0,
        volt: 3600,
        temp: 236,
        hum: 79,
        crc: 114
    }

from a buffer like `7e0d123456deadbeef000e1000ec4f7203` which expands as `7e 0d 123456 deadbeef 00 0e10 00ec 4f 72 03`
