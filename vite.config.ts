/*
 * @Author: nabaonan
 * @Date: 2023-08-25 20:44:48
 * @LastEditors: nabaonan
 * @LastEditTime: 2023-08-28 10:14:14
 * @FilePath: /test-stomp/vite.config.ts
 * @Description: 
 */

import { defineConfig, createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({



  plugins: [vue()],
})
