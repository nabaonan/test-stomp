/*
 * @Author: nabaonan
 * @Date: 2023-08-25 17:55:46
 * @LastEditors: nabaonan
 * @LastEditTime: 2023-08-25 18:24:32
 * @FilePath: /test-stomp/src/client.ts
 * @Description: 
 */
import stompjs from 'stompjs';
// var stompjs = require('stompjs');

export const connect = () => { 

  var client = stompjs.overWS('ws://localhost:61614/stomp');
  var headers = {
    login: 'mylogin',
    passcode: 'mypasscode',
    // additional header
    'client-id': 'my-client-id'
  };
  client.debug = console.log;
  client.connect(headers, function (error:any) {
    // display the error's message header:
    if (error.command == "ERROR") {
      console.error(error.headers.message);
    } else {
      console.log("Connected");
    
   
      let count = 0;
  
      setInterval(() => {
  
        let channel = '/chat/nbn'
        if (count % 2 == 0) {
          channel = '/chat/nbn'
        } else { 
          channel = '/chat/nbn2'
        }
        var quote = {symbol: 'APPL', value: new Date().getTime()};
        client.send(channel, {}, JSON.stringify(quote));
        count++;
    }, 4000);
    }
  });

}
