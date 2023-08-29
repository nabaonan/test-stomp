/*
 * @Author: nabaonan
 * @Date: 2023-08-25 17:33:45
 * @LastEditors: nabaonan
 * @LastEditTime: 2023-08-29 23:17:11
 * @FilePath: /test-stomp/src/server.js
 * @Description: 
 */

import http from 'http';
import URL from 'url';
import { WebSocketServer } from 'ws'

import StompServer from 'stomp-broker-js';



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

createWebSocketServer()


const createStompServer = () => {
  stompHttpServer = http.createServer();


  stompServer = new StompServer({
    server: stompHttpServer,
    debug: console.log,
    path: '/chat',
    protocol: 'ws',

  });

  const getTarget = (id) => {
    let target = ''
    if (id.startsWith('self_')) {
      target = '服务器'
    } else {
      target = '客户端'
    }
    return target
  }

  stompServer.on('connected', (sessionId, headers) => {
    // wsInstance.send(`已连接   `)
  })
  stompServer.on('disconnected', (sessionId, headers) => {
    // wsInstance.send(`已断开 `)
  })
  stompServer.on('error', (error) => {
    wsInstance.send(` 报错了  error=${error}`)
  })
  stompServer.on('subscribe', (sub) => {
    // wsInstance.send(`${getTarget(sub.id)}订阅 id=${sub.id}  频道=${sub.topic}   `)
  })
  stompServer.on('unsubscribe', (sub) => {

    // wsInstance.send(`${getTarget(sub.id)}取消订阅  id=${sub.id}  频道=${sub.topic} `)
  })
  stompServer.on('connecting', (sessionId) => {
    // wsInstance.send(`连接中  `)
  })
  stompServer.on('send', (frame) => {
    // wsInstance.send(`发送数据   频道=${frame.headers.destination}   内容=${frame.body} }`)

  })
  stompHttpServer.listen(61614);



}



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
      // wsInstance.send(`stomp服务开始启动`)

    } else {
      console.log('stomp服务  已经启动过了')
      result.code = 1
      result.msg = 'stompServer is already start'
    }
  } else if (url.startsWith('/stop')) {
    if (stompHttpServer) {
      wsInstance.send(`关闭服务器 `)
      // stompHttpServer.disconnect();
      stompHttpServer.close(() => {
        wsInstance.send(`服务器 已关闭`)
      });

    }



  } else if (url.startsWith('/sub')) {//

    const channelName = query.channelName
    wsInstance.send(`服务器订阅 频道=  ${channelName}`)
    const id = stompServer.subscribe(channelName, function (msg, headers) {
      var topic = headers.destination;
      console.log('nbn-----------start-------')
      console.log(topic, "->{" + (typeof msg) + "}", msg, headers);
      console.log('nbn-----------end-------')

      wsInstance.send(`服务器收到消息： 频道=  ${channelName} ,内容:${msg}`)

    });

    registeMap[channelName] = id
    result.msg = 'sub success'
  } else if (url.startsWith('/unsub')) {
    const channelName = query.channelName
    stompServer.unsubscribe(registeMap[channelName])//只能穿id

    delete registeMap[channelName]
    wsInstance.send(`服务器取消订阅   channelName: ${channelName}`)
    result.msg = 'unsub success'
  } else if (url.startsWith('/send')) {//服务器群发
    const channelName = query.channelName
    const msg = query.msg
    stompServer.send(channelName, {}, msg)
    wsInstance.send(`服务器发送   频道: ${channelName}  内容:${msg}`)
  }

  console.log('返回')
  response.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  response.write(JSON.stringify(result))
  response.end()
})

server.listen(61613);



