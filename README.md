node-red-contrib-binary
=======================

<a href="http://nodered.org" target="_new">Node-RED</a> function that takes the <b>msg.payload</b> and converts it to/from binary data.

Installation
------------

Run the following command in your Node-RED user directory - typically `~/.node-red`

        npm install node-red-contrib-binary

Usage
-----

If the input is a buffer it tries to parse it and creates a javascript object.
If the input is a javascript object it tries to serialize it and creates a buffer.

Pattern language
----------------

The pattern language is specified by the underlying module <a href="https://github.com/bigeasy/packet">packet</a>.
