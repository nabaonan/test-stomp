/*
 * @Author: nabaonan
 * @Date: 2023-08-25 20:44:48
 * @LastEditors: nabaonan
 * @LastEditTime: 2023-08-26 15:57:32
 * @FilePath: /test-stomp/vite.config.ts
 * @Description: 
 */

import { defineConfig,createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import commonjs from 'vite-plugin-commonjs'
import requireTransform from 'vite-plugin-require-transform'

import { VitePluginNode } from 'vite-plugin-node';




// https://vitejs.dev/config/
export default defineConfig({
  // server: {
  //   port: 3699
  // },

  
  plugins: [vue(),

  // ...VitePluginNode({
  //   adapter: 'express',
  //   appPath: './src/express.js',
  // })

  ],
})
