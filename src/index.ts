import { version } from 'vue'
// redirect anything to Vue 3
export * from 'vue'

// compatible with plugin installation but actually does nothing.
export default {
  install: () => {
    if (__DEV__) {
      if (version[0] === '2') {
        console.warn(
          '[vue-composition-api] It seems like you are using Vue 2 with @vue/composition-api@next' +
            ' which is for Vue 3. Please use @vue/composition-api@latest instead.'
        )
      }
    }
  },
}
