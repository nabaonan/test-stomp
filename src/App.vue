<!--
 * @Author: nabaonan
 * @Date: 2023-08-25 17:24:17
 * @LastEditors: nabaonan
 * @LastEditTime: 2023-08-27 15:07:30
 * @FilePath: /test-stomp/src/App.vue
 * @Description: 
-->
<script setup lang="ts">
import { Space, Button, Input, List, Card, Row, Col, Select, Tag, message, ConfigProvider } from 'ant-design-vue';
import { Client, StompSubscription, } from '@stomp/stompjs';
import { computed, ref } from 'vue';

// import Stomp from 'stompjs';




interface ClientObj {
  channelName: string,//当前要订阅的频道

  channels: string[],//已经订阅的频道
  currentChannel: string,//当前选择要发送的频道
  say: string,
  status: boolean,
  msg: string[],
  client?: Client,
  subscribe?: StompSubscription
}

const url = 'ws://localhost:61614/chat';
const httpBaseUrl = 'http://localhost:61614';


const subscribs = ref<{
  title: string,
  status: boolean,
  value: string,
  subscribe?: any
}[]>([])
const serverUrl = ref('');
const serverStatus = ref(false);
const serverMsg = ref<string[]>([])
const clients = ref<ClientObj[]>([])
const serverSay = ref('');
const serverChannelName = ref('')
const serverChooseChannel = ref()

const connect = (index: number) => {
  const client = new Client({
    brokerURL: url,
    onStompError: (frame) => {
      console.log('Broker reported error: ' + frame.headers['message']);
      console.log('Additional details: ' + frame.body);
      clients.value[index].status = false
    },
    onConnect: () => {

      clients.value[index].msg.push(`Connected to ${url}`);
      clients.value[index].client = client
      clients.value[index].status = true

    },
    onWebSocketClose: () => {
      clients.value[index].msg.push(`Disconnected to ${url}`);
      clients.value[index].status = false
    },
  });

  client.activate();


}


// let client2:any = null
// const connect2 = () => { 
//  client2 = Stomp.client(url);


// }

// const subscribe2 = (channelName: string,index:number) => {

//   client2.connect({}, function () {
//     client2.subscribe(channelName, function (message:any) {
//       console.log(message.body);
//       clients.value[index].msg.push(`接收到的消息: ${message.body}`)
//     });
//   });
// }

const unconnect = (index: number) => {

  const client = clients.value[index]
  if (client) {
    client.client?.deactivate()
    client.status = false
  }
}


const subscribe = (channelName: string, index: number) => {

  const client = clients.value[index]
  if (client) {
    if (client.channels.includes(channelName)) {
      message.warn(channelName + '已经订阅过了')
      return
    }
    client.subscribe = client.client?.subscribe(channelName, (message) => {
      client.msg.push(`接收到的消息: ${message.body}`)
    });
    client.channels.push(channelName)
    client.channelName = ''
  }
}

const unsubscribe = (channelName: string, index: number) => {
  const client = clients.value[index]
  if (client) {

    client.subscribe?.unsubscribe();
    // client.client?.unsubscribe(channelName);
    client.channels.splice(client.channels.indexOf(channelName), 1)
  }
}

const send = (msg: string, index: number) => {

  const client = clients.value[index]
  if (client && msg) {
    client.client?.publish({ destination: client.currentChannel, body: msg });

  }
}

// const send2  = (msg: string, index: number) => {

//   const client = clients.value[index]
//   if (client2 && msg) {
//     client2.send(client.currentChannel,{},msg);

//   }
// }


const clear = (index: number) => {
  const client = clients.value[index]
  client.msg = []

}


const startServer = async () => {

  await fetch(`${httpBaseUrl}/start`)
  serverStatus.value = true

  initServerSocket()
}


const serverSubscriptChannel = async (index?: number, currentChannelName?: string) => {


  const channelName = currentChannelName ?? serverChannelName.value

  if (!channelName) {
    message.warn('频道名称不能为空')
    return
  }

  if (!currentChannelName && subscribs.value.some((item) => item.title == serverChannelName.value)) {
    message.warn(serverChannelName.value + '已经注册过了')
    return
  }


  await fetch(`${httpBaseUrl}/sub?channelName=${channelName}`)
  // const subscribe = stompServer.value.watch({ destination: currentChannelName ?? serverChannelName.value })
  //   .subscribe((message) => console.log(message.body));

  if (currentChannelName && index !== undefined) {
    subscribs.value[index].status = true;
    subscribs.value[index].subscribe = subscribe;
    return
  } else {

    subscribs.value.push({
      status: true,
      title: `${serverChannelName.value}`,
      value: `${serverChannelName.value}`,
      subscribe
    })
    serverChannelName.value = ''

  }


}

const serverUnsubscriptChannel = async (index: number) => {

  await fetch(`${httpBaseUrl}/unsub?channelName=${subscribs.value[index].title}`)
  // subscribs.value[index].subscribe.unsubscribe();
  subscribs.value[index].status = false;
}

const delServerChannel = (index: number) => {
  subscribs.value.splice(index, 1)
}


const serverSend = async () => {

  if (canAllSend.value) {

    await fetch(`${httpBaseUrl}/send?msg=${serverSay.value}&channelName=${serverChooseChannel.value}`)
    // stompServer.value.publish({ destination: serverChooseChannel.value, body: serverSay.value });
    // serverMsg.value.push('服务器广播: ' + '频道channel:' + serverChooseChannel.value + '内容:' + serverSay.value)
    serverSay.value = ''
  }
}

const canAllSend = computed<boolean>(() => {
  return (serverStatus.value && serverChooseChannel.value && serverSay.value) as boolean
})


const addClient = () => {
  clients.value.push({
    channelName: '',
    channels: [],
    currentChannel: '',
    say: '',
    status: false,
    msg: [],
  })
}


const initServerSocket = () => {

  const url = "ws://localhost:8000/server-msg";
  const socket = new WebSocket(url);

  socket.onopen = function () {
    console.log("连接建立成功...");
    serverMsg.value.push('连接建立成功')
  };

  socket.onmessage = function (event) {
    console.log("接收到消息：" + event.data);

    serverMsg.value.push(event.data)
  };

  socket.onclose = function () {


    console.log("连接关闭...");
    serverMsg.value.push('连接关闭')
  };

}

const clearServer = async () => {

  serverMsg.value = []
}

</script>

<template>
  <ConfigProvider componentSize="small">
    <Row :gutter="16">

      <Col span="8">
      <Card title="服务器设置" hoverable>

        <Space direction="vertical">
          <Space.Compact>

            <Input style="width: 240px;" v-model:value="serverUrl" :placeholder="`${url}`" />
            <Button @click="startServer" type="primary" v-show="!serverStatus">启动服务</Button>
            <Button type="primary" v-show="serverStatus">运行中</Button>
          </Space.Compact>


          <Space.Compact>
            <Input placeholder="请输入channel名称" v-model:value="serverChannelName" />
            <Button @click="() => serverSubscriptChannel()" :disabled="!serverStatus"> 订阅频道</Button>

          </Space.Compact>

          <List item-layout="horizontal" :data-source="subscribs">
            <template #renderItem="{ index, item }">
              <List.Item :style="{
                background: item.status ? '#00b96ba0' : ''
              }">
                <template #actions>
                  <Button v-show="item.status" danger @click="() => serverUnsubscriptChannel(index)">
                    取消订阅
                  </Button>
                  <template v-if="!item.status">
                    <Button danger @click="() => delServerChannel(index)">
                      删除
                    </Button>
                    <Button type="primary" @click="() => serverSubscriptChannel(index, item.value)">
                      订阅
                    </Button>
                  </template>
                </template>
                <template #default>

                  {{ item.title }}
                </template>
              </List.Item>
            </template>
          </List>



          <Space.Compact>

            <Select style="width: 140px" placeholder="请选择channel" :options="subscribs"
              v-model:value="serverChooseChannel"></Select>

            <Input placeholder="群发消息" v-model:value="serverSay"></Input>
            <Button @click="() => serverSend()" :disabled="!canAllSend">发送</Button>
          </Space.Compact>


        </Space>




      </Card>
      </Col>

      <Col span="8">
      <Card title="服务器接收的消息" hoverable>

        <Button @click="clearServer" danger>清空消息</Button>

        <List :data-source="serverMsg">

          <template #renderItem="{ item }">
            <List.Item>

              {{ item }}

            </List.Item>
          </template>
        </List>

      </Card>
      </Col>

      <Col span="8">
      <Card title="所有客户端">

        <Space direction="vertical">

          <template v-for="(client, index) in clients">


            <Card :title="`用户${index}`" hoverable>

              <Space direction="vertical">

                <Space.Compact>
                  <Button type="primary" v-show="!client.status" @click="() => connect(index)">连接stomp服务器</Button>
                  <Button v-show="client.status" type="primary" @click="() => unconnect(index)">已经连接</Button>
                  <Select style="width: 140px;" placeholder="请选择channel" v-model:value="client.channelName"
                    :fieldNames="{ label: 'title', value: 'value', children: 'children' }" :options="subscribs"></Select>

                  <Button @click="() => subscribe(client.channelName, index)">订阅</Button>
                </Space.Compact>

                <Space>
                  已经订阅的频道:
                  <Tag v-for="item in client.channels" @close="() => unsubscribe(item, index)" closable :key="item"
                    color="blue">{{ item }}</Tag>

                </Space>

                <Space.Compact>
                  <Select style="width: 180px;" :options="subscribs" v-model:value="client.currentChannel"
                    :fieldNames="{ label: 'title', value: 'value', children: 'children' }"></Select>
                  <Input placeholder="请输入消息" v-model:value="client.say"></Input>
                  <Button type="primary" @click="() => send(client.say, index)">发送</Button>
                </Space.Compact>


                <Button danger @click="clear(index)">清空消息</Button>
                <List :data-source="client.msg">
                  <template #renderItem="{ item }">
                    <List.Item>

                      {{ item }}

                    </List.Item>
                  </template>
                </List>


              </Space>





            </Card>
          </template>
          <Button @click="addClient" block type="dashed"> 新增用户</Button>
        </Space>




      </Card>
      </Col>

    </Row>
  </ConfigProvider>
</template>

