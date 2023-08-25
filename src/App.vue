<!--
 * @Author: nabaonan
 * @Date: 2023-08-25 17:24:17
 * @LastEditors: nabaonan
 * @LastEditTime: 2023-08-25 19:17:43
 * @FilePath: /test-stomp/src/App.vue
 * @Description: 
-->
<script setup lang="ts">
import { Space, Button, Input, List } from 'ant-design-vue';
// import stompjs from 'stompjs';
import { Client } from '@stomp/stompjs';
import { ref, toRaw } from 'vue';
import { RxStomp } from "@stomp/rx-stomp";
// import { Subscription } from 'rxjs';

// import {connect} from './client'


const msg = ref('')
const url = 'ws://localhost:61614/ws';
const channelName = ref('/chat/nbn')
const stompServer = ref<RxStomp>()
const subscribs = ref<{
  title: string,
  subscribe: any
}[]>([])
const serverChannelName = ref('')


let client: Client;
const connect = () => {
  client = new Client({
    brokerURL: url,
    onConnect: () => {
      // client.subscribe('/chat/nbn', message =>
      //   console.log(`Received: ${message.body}`)
      // );

    },
  });

  client.activate();

}

const subscribe = () => {

  if (client) {
    client.subscribe(channelName.value, message =>
      console.log(`Received: ${message.body}`)
    );
  }
}

const send = () => {

  if (client && msg.value) {
    client.publish({ destination: '/chat/nbn', body: msg.value });

  }
}



const startServer = () => {

  stompServer.value = new RxStomp();
  stompServer.value.configure({
    brokerURL: url,
  });

  stompServer.value.activate();
}

const serverSubscriptChannel = () => {
  if (stompServer.value) {
    const subscribe = stompServer.value.watch({ destination: channelName.value })
      .subscribe((message) => console.log(message.body));
    subscribs.value.push({
      title: `${toRaw(channelName)}`,
      subscribe
    })
  }
}


const serverUnsubscriptChannel = (index: number) => {
  subscribs.value[index].subscribe.unsubscribe()
}





</script>

<template>
  <Space>

    <Input placeholder="请输入url" />
    <Button @click="connect">连接</Button>
  </Space>

  <Space>

    <Input v-model:value="serverChannelName" />
    <Button @click="startServer">启动服务</Button>
  </Space>


  <Space>
    <Input placeholder="请输入channel名称" />
    <Button @click="serverSubscriptChannel"> 服务器注册channel</Button>
  </Space>

  <List item-layout="horizontal" :data-source="subscribs">
    <template #renderItem="{ index, }">
      <List.Item>
        <List.Item.Meta>

          <template #title>


            <!-- <Typography.Text></Typography.Text> -->

          </template>
          <Button danger @click="() => serverUnsubscriptChannel(index)">
            取消注册
          </Button>
        </List.Item.Meta>
      </List.Item>
    </template>
  </List>

  <Space>
    <Input placeholder="channel"></Input>
    <Button @click="subscribe">订阅</Button>
  </Space>


  <Space>
    <Input placeholder="请输入消息" v-model:value="msg"></Input><Button type="primary" @click="send">发送</Button>
  </Space>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
