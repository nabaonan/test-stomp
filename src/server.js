/*
 * @Author: nabaonan
 * @Date: 2023-08-25 17:33:45
 * @LastEditors: nabaonan
 * @LastEditTime: 2023-08-28 23:52:41
 * @FilePath: /test-stomp/src/server.js
 * @Description: 
 */

import http from 'http';
import URL from 'url';
import { WebSocketServer } from 'ws'

import StompServer from 'stomp-broker-js';


// const requestListener = (req, res) => {
//   res.writeHead(200);
//   res.end('raw node server!~');
// };


const server = http.createServer();

let stompServer = null

let stompHttpServer = null

let wsInstance = null


const createWebSocketServer = () => {

  const baseServer = http.createServer();
  baseServer.listen(8000, () => {
    console.log('websocket server start at 8000')
  });

  const wsServer = new WebSocketServer({ server: baseServer, path: '/server-msg' });
  wsServer.on('connection', function (ws) {
    console.log(`websocket 连接成功.`);
    wsInstance = ws
  });
}


const createStompServer = () => {
  const server = http.createServer();
  server.listen(61614);
  stompServer = new StompServer({
    server: server,
    debug: console.log,
    path: '/chat',
    protocol: 'ws',
    onclose: function (session) {
      console.log('onclose', session)
      wsInstance.send(`onclose`)
    }
  });
  stompHttpServer = server


}

createWebSocketServer()

const registeMap = {}

server.on('request', (req, response) => {

  const { method, url, headers } = req
  let urlObj = URL.parse(url, true)
  const query = urlObj.query
  // console.log('urlParam', query)
  let result = {
    code: 0,
    msg: 'success'
  }


  if (url.startsWith('/start')) {

    if (!stompServer) {
      createStompServer()

    } else {
      console.log('stomp服务  已经启动过了')
      result.code = 1
      result.msg = 'stompServer is already start'
    }
  } else if (url.startsWith('/stop')) {
    if (stompHttpServer) {

      stompHttpServer.close(() => {
        stompHttpServer = null
        stompServer = null
        wsInstance.send(`stomp服务  已经停止`)
        process.exit(0)
      }).on('error', (err) => {
        console.log('关闭stomp服务失败', err)
        result.code = 1
        result.msg = '关闭stomp服务失败'
      });
    }



  } else if (url.startsWith('/sub')) {//

    const channelName = query.channelName
    const id = stompServer.subscribe(channelName, function (msg, headers) {
      var topic = headers.destination;
      console.log('nbn-----------start-------')
      console.log(topic, "->{" + (typeof msg) + "}", msg, headers);
      console.log('nbn-----------end-------')

      wsInstance.send(`服务器接受消息： channelName: ${channelName} ,say:${msg}`)

    });

    registeMap[channelName] = id
    result.msg = 'sub success'
  } else if (url.startsWith('/unsub')) {
    const channelName = query.channelName
    stompServer.unsubscribe(registeMap[channelName])//只能穿id

    delete registeMap[channelName]
    wsInstance.send(`取消订阅   channelName: ${channelName}`)
    result.msg = 'unsub success'
  } else if (url.startsWith('/send')) {//服务器群发
    const channelName = query.channelName
    const msg = query.msg
    stompServer.send(channelName, {}, msg)
    wsInstance.send(`群发消息   channelName: ${channelName}  msg:${msg}`)
  }

  console.log('返回')
  response.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  response.write(JSON.stringify(result))
  response.end()
})

server.listen(61613);



