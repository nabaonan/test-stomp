
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import commonjs from 'vite-plugin-commonjs'
import requireTransform from 'vite-plugin-require-transform'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), commonjs(/* options */), requireTransform({
    fileRegex: /.js$|.vue$/,
  })],
})
