/*
 * @Author: nabaonan
 * @Date: 2023-08-25 17:33:45
 * @LastEditors: nabaonan
 * @LastEditTime: 2023-08-25 17:37:44
 * @FilePath: /test-stomp/src/server.js
 * @Description: 
 */

import http from 'http';

import StompServer from 'stomp-broker-js';

// var http = require("http");
// var StompServer = require('stomp-broker-js');

const  server = http.createServer();
var stompServer = new StompServer({server: server});

server.listen(61614);

stompServer.subscribe("/chat/nbn", function(msg, headers) {
  var topic = headers.destination;
  console.log('nbn-----------start-------')
  console.log(topic, "->{" + (typeof msg) + "}", msg, headers);
  console.log('nbn-----------end-------')
});

stompServer.subscribe("/chat/nbn2", function(msg, headers) {
  var topic = headers.destination;

  console.log('nbn2-----------start-------')
  console.log(topic, "->{" + (typeof msg) + "}", msg, headers);
  console.log('nbn2----------end--------')
});